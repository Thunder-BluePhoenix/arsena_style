import frappe
from frappe import _


def create_pps(self, method=None):
    doc = frappe.get_doc("BOM", self.bom_no)
    item = frappe.get_doc("Item", doc.item)
    pps = frappe.new_doc("Cost Sheet")
    pps.item_code = item.item_code
    pps.collection_name  = item.custom_collection_name
    pps.product_name = item.custom_product_name
    pps.style_no = item.custom_style_no
    pps.season = item.custom_season
    pps.size = item.custom_size
    pps.color = item.custom_color
    pps.is_embroidery = item.custom_is_embroidery
    pps.embroidery = item.custom_embroidery
    pps.embroidery_no = item.custom_embroidery_no
    pps.bom_id = doc.name
    pps.work_order = self.name
    for view in item.custom_views:
        pps.append("views", {
            "view_angle": view.view_angle,
            "image": view.image
        })


    fabric_cost_each = 0
    dyes_cost__each = 0
    embroidery_cost__each = 0
    material_cost__each = 0
    tailor_cost__each = doc.custom_tailor_cost
    for item in doc.items:
        bom_item = frappe.get_doc("Item", item.item_code)
        group_type = bom_item.custom_group_type
        bom_qty = float(doc.quantity)
        est_cost = float(item.amount)
        cost_each = float(est_cost / bom_qty)

        if group_type == "Fabric":
            fabric_cost_each += cost_each
        elif group_type == "DYES":
            dyes_cost__each += cost_each
        elif group_type == "Embroidery":
            embroidery_cost__each += cost_each
        elif group_type == "Material":
            material_cost__each += cost_each
        else:
            continue
    total_cost_each = fabric_cost_each + dyes_cost__each + embroidery_cost__each + material_cost__each + tailor_cost__each
    pps.fabric_cost_each = fabric_cost_each
    pps.dyes_cost__each = dyes_cost__each
    pps.embroidery_cost__each = embroidery_cost__each
    pps.material_cost__each = material_cost__each
    pps.tailor_cost__each = tailor_cost__each

    doc_qty = self.qty
    pps.qty = doc_qty

    pps.total_cost = float(total_cost_each) * doc_qty
    pps.description = item.description

    pps.save()
    pps.submit()
    self.custom_cost_sheet = pps.name
    self.db_update() 
    frappe.msgprint(_("Cost Sheet {0} created from Work Order {1}").format(pps.name, self.name))






def create_fp(self, method=None):
    if self.status == "Completed":
        doc = frappe.get_doc("BOM", self.bom_no)
        item = frappe.get_doc("Item", doc.item)
        
        # Get produced quantity to create appropriate number of Final Products
        doc_qty = self.produced_qty if hasattr(self, 'produced_qty') else self.qty
        
        # Loop through each unit produced and create a separate Final Product
        for i in range(int(doc_qty)):
            # Create new final product document
            pf = frappe.new_doc("Final Product")
            
            # Set basic details
            pf.item_code = item.item_code
            pf.collection_name = item.custom_collection_name
            pf.product_name = item.custom_product_name
            pf.style_no = item.custom_style_no
            pf.season = item.custom_season
            pf.size = item.custom_size
            pf.color = item.custom_color
            pf.is_embroidery = item.custom_is_embroidery
            pf.embroidery = item.custom_embroidery
            pf.embroidery_no = item.custom_embroidery_no
            pf.bom_id = doc.name
            pf.work_order = self.name
            pf.cost_sheet = self.custom_cost_sheet
            
            # Set serial number / tracking number (1 of N, 2 of N, etc.)
            current_unit = i + 1
            pf.final_no_qty = f"{current_unit}/{doc_qty}"
            
            # Create product slug with BOM ID, Work Order ID, Cost Sheet, and final_no_qty
            pf.product_slug = f"{doc.name}-{self.name}-{self.custom_cost_sheet}-{pf.final_no_qty}".replace("/", "-")
            
            # Add views
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
            tailor_cost__each = doc.custom_tailor_cost
            
            for item in doc.items:
                bom_item = frappe.get_doc("Item", item.item_code)
                group_type = bom_item.custom_group_type
                bom_qty = float(doc.quantity)
                est_cost = float(item.amount)
                cost_each = float(est_cost / bom_qty)
                
                pf.append("materials", {
                    "item_code": item.item_code
                })
                
                if group_type == "Fabric":
                    fabric_cost_each += cost_each
                elif group_type == "DYES":
                    dyes_cost__each += cost_each
                elif group_type == "Embroidery":
                    embroidery_cost__each += cost_each
                elif group_type == "Material":
                    material_cost__each += cost_each
                else:
                    continue
                    
            total_cost_each = fabric_cost_each + dyes_cost__each + embroidery_cost__each + material_cost__each + tailor_cost__each
            
            # Set total cost for the individual item
            pf.total_cost = float(total_cost_each)
            pf.description = item.description
            
            # Generate barcode using a hash of important document fields
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
                "description": pf.description,
                "amended_from": pf.amended_from,
                "bom_id": pf.bom_id,
                "work_order": pf.work_order,
                "cost_sheet": pf.cost_sheet,
                "naming_series": pf.naming_series,
                "posting_date": str(pf.posting_date),
                "posting_time": str(pf.posting_time)
            }
            
            # Store the JSON data as metadata in the document
            pf.barcode_metadata = json.dumps(barcode_data)
            
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
            pf.save()
            pf.submit()
    else:
        pass


        


