# Copyright (c) 2025, Phoenix and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.model.document import Document
import hashlib
import json

class FinalProduct(Document):
	def before_save(self, method=None):
		if self.created_without_workorder_doc == 1 and self.barcode == None:
			barcode_data = {
                "collection_name": self.collection_name or None,
                "product_name": self.product_name or None,
                "item_code": self.item_code or None,
                "product_slug": self.product_slug or None,
                "final_no_qty": self.final_no_qty or None,
                "style_no": self.style_no or None,
                "season": self.season or None,
                "is_embroidery": self.is_embroidery or None,
                "embroidery": self.embroidery or None,
                "embroidery_no": self.embroidery_no or None,
                "size": self.size or None,
                "color": self.color or None,
                "views": [{"view_angle": v.view_angle, "image": v.image} for v in self.views] if self.views else [],
                "materials": [{"item_code": m.item_code} for m in self.materials] if self.materials else [],
                "barcode": "",  # Will be filled later
                "total_cost": self.total_cost or None,
                "description": self.description or None,
                "amended_from": self.amended_from or None,
                "bom_id": self.bom_id or None,
                "work_order": self.work_order or None,
                "cost_sheet": self.cost_sheet or None,
                "naming_series": self.naming_series,
                "posting_date": str(self.posting_date),
                "posting_time": str(self.posting_time)
            }
			self.barcode_metadata = json.dumps(barcode_data)

			# Create a unique string from all fields for the barcode hash
			unique_string = ""
			key_fields = [
				'collection_name', 'product_name', 'item_code', 'product_slug', 
				'final_no_qty', 'style_no', 'season', 'is_embroidery', 
				'embroidery', 'embroidery_no', 'size', 'color', 
				'total_cost', 'bom_id', 'work_order', 'cost_sheet', 
				'naming_series', 'posting_date', 'posting_time'
			]

			for field in key_fields:
				value = getattr(self, field, '')
				if value:
					unique_string += str(value)

			# Add current timestamp for uniqueness
			unique_string += str(frappe.utils.now())

			# Generate MD5 hash and extract numeric digits for the barcode
			barcode_hash = hashlib.md5(unique_string.encode()).hexdigest()
			numeric_barcode = ''.join(filter(str.isdigit, barcode_hash))[:12]

			# Calculate EAN-13 check digit
			def calculate_check_digit(partial_code):
				weights = [1, 3] * 6
				total = sum(int(partial_code[i]) * weights[i] for i in range(12))
				check_digit = (10 - (total % 10)) % 10
				return check_digit

			# Generate full EAN-13 barcode
			full_barcode = numeric_barcode + str(calculate_check_digit(numeric_barcode))

			# Assign the EAN-13 barcode to the document
			self.barcode = full_barcode
            



def update_after_submit(self, method=None):
	if self.item_code:
		item = frappe.get_doc("Item", self.item_code)
		self.valuation = item.valuation