frappe.ui.form.on("Work Order", {
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


