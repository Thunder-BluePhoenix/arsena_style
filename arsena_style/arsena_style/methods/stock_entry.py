import frappe
from frappe import _


def create_fp(self, method=None):
   if self.stock_entry_type == "Manufacture" and self.work_order:
       try:
           # Get the Work Order document
           workorder_doc = frappe.get_doc("Work Order", self.work_order)
           
           # Get the BOM document
           doc = frappe.get_doc("BOM", workorder_doc.bom_no)
           
           # Get the Item document for the BOM
           item = frappe.get_doc("Item", doc.item)
           
           # Get produced quantity to create appropriate number of Final Products
           doc_qty = self.fg_completed_qty
           
           # Loop through each unit produced and create a separate Final Product
           for i in range(int(doc_qty)):
               # Create new final product document
               pf = frappe.new_doc("Final Product")
               
               # Set basic details with error handling
               pf.item_code = item.item_code
               
               # Use get method to safely retrieve custom fields
               pf.collection_name = item.get('custom_collection_name', '')
               pf.product_name = item.get('custom_product_name', '')
               pf.style_no = item.get('custom_style_no', '')
               pf.season = item.get('custom_season', '')
               pf.size = item.get('custom_size', '')
               pf.color = item.get('custom_color', '')
               pf.is_embroidery = item.get('custom_is_embroidery', 0)
               pf.embroidery = item.get('custom_embroidery', '')
               pf.embroidery_no = item.get('custom_embroidery_no', '')
               
               pf.bom_id = doc.name
               pf.work_order = workorder_doc.name
               pf.cost_sheet = workorder_doc.get('custom_cost_sheet', '')
               
               # Set serial number / tracking number (1 of N, 2 of N, etc.)
               current_unit = i + 1
               pf.final_no_qty = f"{current_unit}/{doc_qty}"
               
               # Create product slug with BOM ID, Work Order ID, Cost Sheet, and final_no_qty
               pf.product_slug = f"{doc.name}-{workorder_doc.name}-{pf.cost_sheet}-{pf.final_no_qty}".replace("/", "-")
               
               # Add views
               if hasattr(item, 'custom_views'):
                   for view in item.custom_views:
                       pf.append("views", {
                           "view_angle": view.view_angle,
                           "image": view.view_angle
                       })
               
               # Calculate costs
               fabric_cost_each = 0
               dyes_cost__each = 0
               embroidery_cost__each = 0
               material_cost__each = 0
               tailor_cost__each = doc.get('custom_tailor_cost', 0)
               
               for bom_item in doc.items:
                   try:
                       # Get the individual item from the BOM item
                       item_doc = frappe.get_doc("Item", bom_item.item_code)
                       
                       # Safely get group type
                       group_type = item_doc.get('custom_group_type', '')
                       
                       bom_qty = float(doc.quantity or 1)
                       est_cost = float(bom_item.amount or 0)
                       cost_each = float(est_cost / bom_qty) if bom_qty else 0
                       
                       pf.append("materials", {
                           "item_code": bom_item.item_code
                       })
                       
                       if group_type == "Fabric":
                           fabric_cost_each += cost_each
                       elif group_type == "DYES":
                           dyes_cost__each += cost_each
                       elif group_type == "Embroidery":
                           embroidery_cost__each += cost_each
                       elif group_type == "Material":
                           material_cost__each += cost_each
                   except Exception as item_error:
                       frappe.log_error(f"Error processing BOM item {bom_item.item_code}: {str(item_error)}")
               
               # Calculate total cost
               total_cost_each = (
                   fabric_cost_each + 
                   dyes_cost__each + 
                   embroidery_cost__each + 
                   material_cost__each + 
                   tailor_cost__each
               )
               
               # Set total cost for the individual item
               pf.total_cost = float(total_cost_each)
               pf.description = item.description
               
               # Generate barcode (using the previous implementation)
               import hashlib
               import json
               
               # Create a dictionary with all the document fields for embedding in metadata
               barcode_data = {
                   "collection_name": pf.collection_name,
                   "product_name": pf.product_name,
                   "item_code": pf.item_code,
                   "product_slug": pf.product_slug,
                   "final_no_qty": pf.final_no_qty,
                   "style_no": pf.style_no,
                   "season": pf.season,
                   "is_embroidery": pf.is_embroidery,
                   "embroidery": pf.embroidery,
                   "embroidery_no": pf.embroidery_no,
                   "size": pf.size,
                   "color": pf.color,
                   "views": [{"view_angle": v.view_angle, "image": v.image} for v in pf.views] if pf.views else [],
                   "materials": [{"item_code": m.item_code} for m in pf.materials] if pf.materials else [],
                   "barcode": "",  # Will be filled later
                   "total_cost": pf.total_cost,
                   "description": pf.description
               }
               
               # Store the JSON data as metadata in the document
               pf.barcode_metadata = json.dumps(barcode_data)
               
               # Generate barcode - same implementation as before
               unique_string = ""
               key_fields = [
                   'collection_name', 'product_name', 'item_code', 'product_slug',
                   'final_no_qty', 'style_no', 'season', 'is_embroidery',
                   'embroidery', 'embroidery_no', 'size', 'color',
                   'total_cost'
               ]
               
               for field in key_fields:
                   value = getattr(pf, field, '')
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
               pf.barcode = full_barcode
               
               # Save and submit the document
               try:
                   pf.save()
                   pf.submit()
               except Exception as save_error:
                   frappe.log_error(f"Error saving Final Product: {str(save_error)}")
       
       except Exception as main_error:
           frappe.log_error(f"Error in create_fp method: {str(main_error)}")
   else:
       pass

