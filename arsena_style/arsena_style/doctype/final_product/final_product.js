frappe.ui.form.on('Final Product', {
    // When item_code is entered after style_no, fetch corresponding values
    item_code: function(frm) {
        var style_no = frm.doc.style_no;
        var item_code = frm.doc.item_code;
        
        // Only proceed if both style_no and item_code have values
        if(style_no && item_code) {
            fetch_item_details(frm);
        }
    },
    
    // Also trigger when style_no is changed after item_code is already set
    style_no: function(frm) {
        var style_no = frm.doc.style_no;
        var item_code = frm.doc.item_code;
        
        if(style_no && item_code) {
            fetch_item_details(frm);
        }
    }
});

function fetch_item_details(frm) {
    var style_no = frm.doc.style_no;
    var item_code = frm.doc.item_code;
    
    frappe.call({
        method: 'frappe.client.get',
        args: {
            doctype: 'Item',
            name: item_code
        },
        callback: function(response) {
            if(response.message) {
                var item = response.message;
                
                // Check if the style_no matches
                if(item.custom_style_no !== style_no) {
                    frappe.msgprint(__('Warning: The Style No you entered does not match the Style No for this Item.'));
                    return;
                }
                
                // Set scalar values from Item to Final Product
                frm.set_value('collection_name', item.custom_collection_name);
                frm.set_value('product_name', item.custom_product_name);
                frm.set_value('color', item.custom_color);
                frm.set_value('size', item.custom_size);
                frm.set_value('season', item.custom_season);
                frm.set_value('is_embroidery', item.custom_is_embroidery);
                frm.set_value('embroidery', item.custom_embroidery);
                frm.set_value('embroidery_no', item.custom_embroidery_no);
                
                // Handle the table field "views"
                // First clear the existing rows
                frm.clear_table('views');
                
                // Copy data from item.custom_views to frm.doc.views
                if(item.custom_views && item.custom_views.length > 0) {
                    // Loop through each row in custom_views
                    item.custom_views.forEach(function(view_row) {
                        var child = frm.add_child('views');
                        
                        // Copy the two fields we need
                        child.view_angle = view_row.view_angle;
                        child.image = view_row.image;
                    });
                    
                    // Refresh the views table
                    frm.refresh_field('views');
                }
                
                frappe.show_alert({
                    message: __('Item details fetched successfully'),
                    indicator: 'green'
                }, 3);
            } else {
                frappe.msgprint(__('Item not found with the given Item Code'));
            }
        }
    });
}

