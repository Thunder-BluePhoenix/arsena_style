import frappe
from frappe import _


def create_pps(doc, method=None):
    # doc = frappe.get_doc("BOM", self.bom_no)
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
    pps.description = item.description
    
    # pps.work_order = self.name
    for view in item.custom_views:
        pps.append("views", {
            "view_angle": view.view_angle,
            "image": view.image
        })

    for i in doc.items:
        pps.append("raw_items", {
            # Essential fields (marked as mandatory in CSV)
            "item_code": i.item_code,
            "qty": i.qty,
            "uom": i.uom,
            "rate": i.rate,
            
            # Other important fields
            "item_name": i.item_name,
            "operation": i.operation,
            "do_not_explode": i.do_not_explode,
            "bom_no": i.bom_no,
            "source_warehouse": i.source_warehouse,
            "allow_alternative_item": i.allow_alternative_item,
            "is_stock_item": i.is_stock_item,
            "description": i.description,
            "image": i.image,
            "stock_qty": i.stock_qty,
            "stock_uom": i.stock_uom,
            "conversion_factor": i.conversion_factor,
            "base_rate": i.base_rate,
            "amount": i.amount,
            "base_amount": i.base_amount,
            "qty_consumed_per_unit": i.qty_consumed_per_unit,
            "has_variants": i.has_variants,
            "include_item_in_manufacturing": i.include_item_in_manufacturing,
            "original_item": i.original_item,
            "sourced_by_supplier": i.sourced_by_supplier
        })


    for i in doc.custom_services:
        pps.append("services", {
            # Essential fields (marked as mandatory in CSV)
            "service": i.service,
            "qty": i.qty,
            "uom": i.uom,
            "rate": i.rate,
            "amount": i.amount,
            "time": i.time,
            "vendor": i.vendor,
            
        })
    bom_qty = float(doc.quantity)
    tailor_cost__each = float(doc.custom_tailor_cost)/bom_qty
    
    pps.tailor_cost = tailor_cost__each
    pps.timetailor = doc.custom_time_taken_by_tailor
    pps.total_consumption = doc.custom_total_consumption
    total_mat_amount = (sum(float(row.amount or 0) for row in doc.items))/bom_qty
    total_opp_amount = (sum(float(row.amount or 0) for row in doc.custom_services))/bom_qty
    pps.operation_cost = total_opp_amount
    pps.material_cost = total_mat_amount
    pps.service_cost = total_opp_amount + tailor_cost__each
    total_amount = total_opp_amount + tailor_cost__each + total_mat_amount

    doc_qty = 1
    pps.qty = doc_qty

    pps.total_cost = float(total_amount) * doc_qty
    

    pps.save()
    pps.submit()
    doc.custom_cost_sheet = pps.name
    doc.db_update() 
    frappe.msgprint(_("Cost Sheet {0} created from BOM{1}").format(pps.name, doc.name))





import frappe
from frappe import _

@frappe.whitelist()
@frappe.validate_and_sanitize_search_inputs
def get_allowed_vendors(doctype, txt, searchfield, start, page_len, filters):
    """
    Get list of vendors allowed for a specific service item
    
    Args:
        doctype (str): The DocType being searched (Supplier)
        txt (str): Search text
        searchfield (str): Field being searched
        start (int): Start index for pagination
        page_len (int): Number of results per page
        filters (dict): Additional filters, containing the service item
        
    Returns:
        list: List of allowed vendors as tuples (vendor_name, vendor_id)
    """
    if not filters.get('service'):
        return []
    
    service_item = filters.get('service')
    
    # First, let's debug the structure of Operation Vendor
    # Get field names from Operation Vendor doctype
    fields = frappe.db.get_table_columns("Operation Vendor")
    
    # Use the correct field name for supplier based on the actual schema
    supplier_field = "supplier"  # This is what we assumed
    
    # Get all vendors associated with this service item
    # Using a more robust SQL query that doesn't rely on specific column names
    vendor_data = frappe.db.sql("""
        SELECT ov.supplier
        FROM `tabOperation Vendor` ov
        WHERE ov.parent = %s
    """, (service_item,))
    
    if not vendor_data:
        return []
    
    # Extract vendor names into a list
    vendor_list = [v[0] for v in vendor_data]
    
    # If no vendors found, return empty list
    if not vendor_list:
        return []
    
    # Now query the Supplier doctype with these allowed vendors
    # and any additional text search criteria
    vendors_str = "'" + "','".join(vendor_list) + "'"
    
    return frappe.db.sql(f"""
        SELECT name, name as supplier_name
        FROM `tabSupplier`
        WHERE name IN ({vendors_str})
        AND (name LIKE %s OR supplier_name LIKE %s)
        ORDER BY name
        LIMIT %s, %s
    """, ("%" + txt + "%", "%" + txt + "%", start, page_len))

