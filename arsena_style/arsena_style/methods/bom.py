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

    doc_qty = doc.quantity
    pps.qty = doc_qty

    pps.total_cost = float(total_cost_each) * doc_qty
    pps.description = item.description

    pps.save()
    pps.submit()
    doc.custom_cost_sheet = pps.name
    doc.db_update() 
    frappe.msgprint(_("Cost Sheet {0} created from BOM{1}").format(pps.name, doc.name))



