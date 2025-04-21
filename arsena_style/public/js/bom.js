frappe.ui.form.on("BOM", {
	refresh(frm) {
        frm.add_custom_button(__('Print Cost Sheet'), function() {
            frappe.model.with_doctype(frm.doc.doctype, function() {
                var w = window.open(
                    frappe.urllib.get_full_url(
                        '/printview?doctype=' + 
                        encodeURIComponent('Cost Sheet') +
                        '&name=' + 
                        encodeURIComponent(frm.doc.custom_cost_sheet) +
                        '&trigger_print=1' +
                        '&format=' + 
                        encodeURIComponent('Cost Sheet LandScape') +
                        '&no_letterhead=0'
                    )
                );
                if (!w) {
                    frappe.msgprint(__("Please enable pop-ups"));
                }
            });
        });

	},
});

frappe.ui.form.on('Service Operations', {
    service: function(frm, cdt, cdn) {
        let row = locals[cdt][cdn];
        if (row.service) {
            // Fetch service item details and populate the row
            frappe.model.with_doc('Service Items', row.service, function() {
                let service_doc = frappe.get_doc('Service Items', row.service);
                
                // Set the time from service item
                frappe.model.set_value(cdt, cdn, 'time', service_doc.time);
                
                // Set default qty to 1
                frappe.model.set_value(cdt, cdn, 'qty', 1);
                
                // Set rate from service item price
                frappe.model.set_value(cdt, cdn, 'rate', service_doc.price);

                frappe.model.set_value(cdt, cdn, 'uom', service_doc.uom);
                
                // Calculate amount (qty * rate)
                calculate_amount(frm, cdt, cdn);
                
                // Extract supplier names from the service item's vendor table
                if (service_doc.vendor && service_doc.vendor.length) {
                    const allowed_vendors = service_doc.vendor
                        .filter(row => row.vendor)
                        .map(row => row.vendor);
                    
                    console.log("Allowed vendors for service", row.service, ":", allowed_vendors);
                    
                    // Store the allowed vendors in a custom property
                    cur_frm.service_vendors = cur_frm.service_vendors || {};
                    cur_frm.service_vendors[row.service] = allowed_vendors;
                    
                    // Set default vendor if only one option is available
                    if (allowed_vendors.length === 1 && !row.vendor) {
                        frappe.model.set_value(cdt, cdn, 'vendor', allowed_vendors[0]);
                    }
                }
            });
        }
    },
    
    vendor: function(frm, cdt, cdn) {
        let row = locals[cdt][cdn];
        if (row.service && row.vendor) {
            // Find vendor-specific pricing in the service item
            frappe.model.with_doc('Service Items', row.service, function() {
                let service_doc = frappe.get_doc('Service Items', row.service);
                
                if (service_doc.vendor && service_doc.vendor.length) {
                    // Find the selected vendor in the service item's vendor table
                    let vendor_row = service_doc.vendor.find(v => v.supplier === row.vendor);
                    
                    if (vendor_row && vendor_row.price) {
                        // If vendor-specific price exists, use it
                        frappe.model.set_value(cdt, cdn, 'rate', vendor_row.price);
                    }
                }
                
                // Calculate amount after rate is updated
                calculate_amount(frm, cdt, cdn);
            });
        }
    },
    
    qty: function(frm, cdt, cdn) {
        calculate_amount(frm, cdt, cdn);
    },
    
    rate: function(frm, cdt, cdn) {
        calculate_amount(frm, cdt, cdn);
    }
});

// Helper function to calculate amount
function calculate_amount(frm, cdt, cdn) {
    let row = locals[cdt][cdn];
    let amount = (row.qty || 0) * (row.rate || 0);
    frappe.model.set_value(cdt, cdn, 'amount', amount);
}

// Add to BOM doctype's client script
frappe.ui.form.on('BOM', {
    refresh: function(frm) {
        // Initialize the service vendors object if it doesn't exist
        frm.service_vendors = frm.service_vendors || {};
        
        // Set up the vendor filter
        setup_vendor_filter(frm);
    },
    
    // Also set up filtering when the form is loaded
    onload: function(frm) {
        setup_vendor_filter(frm);
    },
    
    // Also set up filtering after the form is loaded
    after_load: function(frm) {
        setup_vendor_filter(frm);
    }
});

// Function to set up vendor filtering
function setup_vendor_filter(frm) {
    frm.set_query("vendor", "custom_services", function(doc, cdt, cdn) {
        let child = locals[cdt][cdn];
        
        if (child.service && frm.service_vendors && frm.service_vendors[child.service]) {
            let allowed_vendors = frm.service_vendors[child.service] || [];
            console.log("Applying filter for vendor in row", cdn, "with allowed vendors:", allowed_vendors);
            
            return {
                filters: [
                    ["name", "in", allowed_vendors]
                ]
            };
        } else {
            // If no service is selected or no vendors found
            console.log("No service selected or no vendors found for service", child.service);
            return {
                filters: [
                    ["name", "=", ""] // Show no results
                ]
            };
        }
    });
}

