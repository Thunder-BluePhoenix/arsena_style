// Add the measurement button beside the edit pencil
function add_measurement_button_to_row(row, frm) {
    if (!row.doc) return;
    
    setTimeout(() => {
        
        // const $itemsHeader = frm.fields_dict['items'].grid.wrapper.find('.grid-heading-row');
      
        const $itemsHeader = frm.fields_dict['items'].grid.wrapper.find('.grid-heading-row');
        const $itemsrow=$itemsHeader.find('.data-row')
        $itemsrow.css({
            'flex-wrap': 'nowrap'
        })
        console.log("itemrow",$itemsrow);
        
        if ($itemsHeader.length > 0) {
            // Find the column with the settings gear icon specifically
            const $settingsCol = $itemsHeader.find('.col').filter(function() {
                return $(this).find('use[href="#icon-setting-gear"]').length > 0;
            });
            
            if ($settingsCol.length > 0) {
                // Add proper sizing and flex classes
                $settingsCol.addClass('col-1');
                $settingsCol.addClass('d-flex justify-content-center');
                
                // Ensure the column doesn't wrap to a new line
                // $settingsCol.css({
                //     'min-width': '40px',
                //     'flex-shrink': '0',
                //     'flex-basis': 'auto'
                // });
                
                console.log("Added styling to settings column in header");
            } else {
                // Fallback to last column if gear icon not found
                const $lastCol = $itemsHeader.find('.col').last();
                $lastCol.addClass('col-1 d-flex justify-content-center');
                // $lastCol.css({
                //     'min-width': '40px',
                //     'flex-shrink': '0',
                //     'flex-basis': 'auto'
                // });
            }
            
            // Add some margin to other columns to prevent crowding
            $itemsHeader.find('.col').not($settingsCol).css('margin-right', '2px');
        }
        
        

        const $editArea = $(row.wrapper).find('.btn-open-row').closest('.row');
        if($editArea.length===0) return;
        if ($editArea.find('.measurement-btn').length > 0) return;
        // if ($editArea.length > 0) {
            // Check if already added
            // if ($editArea.find('.measurement-btn').length === 0) {
        const $measureBtn = $(`
            <div class="measurement-btn col" data-toggle="tooltip" data-placement="right" title="Measurements"
                style="cursor:pointer;">
                <a draggable="false" style="color: inherit;">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="15px" height="15px">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75" />
                    </svg>

                </a>
            </div>
        `);

        // Insert ruler after pencil button inside the same floating area
        $editArea.append($measureBtn);
        // Click action
        $measureBtn.on('click', function(e) {
            e.stopPropagation(); // prevent opening the edit dialog
            open_measurement_dialog(frm, row.doc, row.doc.idx);
        });
    // }
        // }
    }, 50); // slight delay
}

function fix_header_columns(frm) {
    console.log("function cholche");
    
    // Select the grid heading row
    const $itemsHeader = frm.fields_dict['items'].grid.wrapper.find('.grid-heading-row');
    
    if ($itemsHeader.length > 0) {
        // Find the column with the settings gear icon specifically
        const $settingsCol = $itemsHeader.find('.col').filter(function() {
            return $(this).find('use[href="#icon-setting-gear"]').length > 0;
        });
        
        if ($settingsCol.length > 0) {
            // Add col-1 class if not already present
            $settingsCol.addClass('col-1');
            $settingsCol.addClass('d-flex justify-content-center');
            
            console.log("Added col-1 class to settings column in header");
        } else {
            // Fallback to last column if gear icon not found
            $itemsHeader.find('.col').last().addClass('col-1 d-flex justify-content-center');
        }
    }
}


// Setup buttons for all rows and new rows
function setup_measurement_buttons(frm) {
    // if (!frm.fields_dict['items']) return;
    if (!frm.fields_dict['items'] || !frm.fields_dict['items'].grid) return;

    setTimeout(() => {
        frm.fields_dict['items'].grid.grid_rows.forEach(row => {
            add_measurement_button_to_row(row, frm);
        });

    }, 100);
    frm.fields_dict['items'].grid.on('after_add_row', function(row) {
        add_measurement_button_to_row(row, frm);
    });


}

// Measurement dialog (example function)
function open_measurement_dialog(frm, row_doc) {
    let existing_measurements = {};
    if (row_doc.custom_measurement_details) {
        try {
            existing_measurements = JSON.parse(row_doc.custom_measurement_details);
        } catch (e) {
            console.error("Error parsing measurement data:", e);
        }
    }

    let measurement_dialog = new frappe.ui.Dialog({
        title: __('Measurements'),
        fields: get_measurement_fields(),
        size: 'extra_large',
        primary_action_label: __('Save'),
        primary_action: function() {
            let values = measurement_dialog.get_values();
            let measurements_json = JSON.stringify(values);

            frappe.model.set_value(row_doc.doctype, row_doc.name, 'custom_measurement_details', measurements_json);

            frm.refresh_field('items');
            measurement_dialog.hide();
            frappe.show_alert({
                message: __('Measurements saved successfully'),
                indicator: 'green'
            });
        }
    });

    if (Object.keys(existing_measurements).length) {
        measurement_dialog.set_values(existing_measurements);
    }

    measurement_dialog.show();
}



// Trigger on Sales Order
frappe.ui.form.on('Sales Order', {
    // items: function(frm) {
    //     setup_measurement_buttons(frm);
    // },
    refresh(frm) {
        setup_measurement_buttons(frm);
        fix_header_columns(frm);   
    },

    // Also handle when the form loads (in case refresh doesn't trigger properly)
    onload(frm) {
        setup_measurement_buttons(frm);
        fix_header_columns(frm);
    },
    
    // Handle when items are changed or when the field is refreshed

});


frappe.ui.form.on('Sales Order Item', {
  
    item_code: function(frm) {
        setTimeout(()=>{
            setup_measurement_buttons(frm);
        },500)
    },
});



 
 function open_measurement_dialog(frm, row_doc, row_idx) {
    // Load existing measurements if available
    let existing_measurements = {};
    if (row_doc.custom_measurement_details) {
        try {
            existing_measurements = JSON.parse(row_doc.custom_measurement_details);
        } catch (e) {
            console.error("Error parsing measurement data:", e);
        }
    }
    
    // Get item name for the dialog subtitle
    const item_name = row_doc.item_name || row_doc.item_code || "Item";
   
    // Create a new dialog
    let measurement_dialog = new frappe.ui.Dialog({
        title: __('Measurements'),
        fields: [
            {
                fieldtype: 'HTML',
                fieldname: 'item_info',
                options: `<div class="row">
                            <div class="col-sm-12">
                                <p class="text-muted"><strong>Row #${row_idx}:</strong> ${item_name}</p>
                                <hr style="margin: 10px -15px 15px;">
                            </div>
                        </div>`
            },
            ...get_measurement_fields()
        ],
        size: 'extra-large', // Make dialog extra large
        primary_action_label: __('Save'),
        primary_action: function() {
            let values = measurement_dialog.get_values();
            
            // Remove the item_info from values since it's just display HTML
            delete values.item_info;
            
            // Convert values to JSON string
            let measurements_json = JSON.stringify(values);
           
            // Update the custom field in the row
            frappe.model.set_value(row_doc.doctype, row_doc.name, 'custom_measurement_details', measurements_json);
           
            // Refresh the grid to show updated values
            frm.refresh_field('items');
           
            measurement_dialog.hide();
            frappe.show_alert({
                message: __('Measurements saved successfully'),
                indicator: 'green'
            });
            frm.save()
        }
    });
   
    // Set existing values if available
    if (Object.keys(existing_measurements).length) {
        measurement_dialog.set_values(existing_measurements);
    }
   
    measurement_dialog.show();
 }
 
 
 function get_measurement_fields() {
    return [
        // Circumference Section
        {
            label: 'Circumference MSTS',
            fieldname: 'circumference_section',
            fieldtype: 'Section Break'
        },
        {
            label: 'Above BUST',
            fieldname: 'custom_above_bust',
            fieldtype: 'Data'
        },
        {
            label: 'Round BUST',
            fieldname: 'custom_round_bust',
            fieldtype: 'Data'
        },
        {
            label: 'Under BUST',
            fieldname: 'custom_under_bust',
            fieldtype: 'Data'
        },
        {
            fieldtype: 'Column Break'
        },
        {
            label: 'HIP',
            fieldname: 'custom_hip',
            fieldtype: 'Data'
        },
        {
            label: 'Waist',
            fieldname: 'custom_waist',
            fieldtype: 'Data'
        },
       
        // Upper Torso Section
        {
            label: 'Upper Torso',
            fieldname: 'upper_torso_section',
            fieldtype: 'Section Break'
        },
        {
            label: 'Shoulder Slope',
            fieldname: 'custom_shoulder_slope',
            fieldtype: 'Data'
        },
        {
            fieldtype: 'Column Break'
        },
        {
            label: 'Apex to Apex',
            fieldname: 'custom_apex_to_apex',
            fieldtype: 'Data'
        },
        {
            fieldtype: 'Column Break'
        },
        {
            label: 'Shoulder to Point',
            fieldname: 'custom_shoulder_to_point',
            fieldtype: 'Data'
        },
       
        // Lower Torso Section
        {
            label: 'Lower Torso',
            fieldname: 'lower_torso_section',
            fieldtype: 'Section Break'
        },
        {
            label: 'Thigh Rd Floor',
            fieldname: 'custom_thigh_rd_floor',
            fieldtype: 'Data'
        },
        {
            label: 'Heels',
            fieldname: 'custom_heels',
            fieldtype: 'Data'
        },
        {
            fieldtype: 'Column Break'
        },
        {
            label: 'Thigh Rd Up',
            fieldname: 'custom_thigh_rd_up',
            fieldtype: 'Data'
        },
        {
            label: 'Thigh Rd Mid',
            fieldname: 'custom_thigh_rd_mid',
            fieldtype: 'Data'
        },
        {
            fieldtype: 'Column Break'
        },
        {
            label: 'Knee RD up',
            fieldname: 'custom_knee_rd_up',
            fieldtype: 'Data'
        },
        {
            label: 'Knee RD Down',
            fieldname: 'custom_knee_rd_down',
            fieldtype: 'Data'
        },
        {
            fieldtype: 'Column Break'
        },
        {
            label: 'Calf RD',
            fieldname: 'custom_calf_rd',
            fieldtype: 'Data'
        },
        {
            label: 'Ankle RD',
            fieldname: 'custom_ankle_rd',
            fieldtype: 'Data'
        },
       
        // Arm Section
        {
            label: 'Arm MSTS',
            fieldname: 'arm_section',
            fieldtype: 'Section Break'
        },
        {
            label: 'Arm Hole',
            fieldname: 'custom_arm_hole',
            fieldtype: 'Data'
        },
        {
            label: 'Blouse F',
            fieldname: 'custom_blouse_f',
            fieldtype: 'Data'
        },
        {
            label: 'Blouse B',
            fieldname: 'custom_blouse_b',
            fieldtype: 'Data'
        },
        {
            fieldtype: 'Column Break'
        },
        {
            label: 'Full Sleeve Length',
            fieldname: 'custom_full_sleeve_length',
            fieldtype: 'Data'
        },
        {
            label: 'Sleeves Rounding',
            fieldname: 'custom_sleeves_rounding',
            fieldtype: 'Data'
        },
        {
            fieldtype: 'Column Break'
        },
        {
            label: 'Elbow Sleeve Length',
            fieldname: 'custom_elbow_sleeve_length',
            fieldtype: 'Data'
        },
        {
            label: 'Elbow Sleeves Rounding',
            fieldname: 'custom_elbow_sleeves_rounding',
            fieldtype: 'Data'
        },
        {
            fieldtype: 'Column Break'
        },
        {
            label: 'Short Sleeve Length',
            fieldname: 'custom_short_sleeve_length',
            fieldtype: 'Data'
        },
        {
            label: 'Short Sleeves Rounding',
            fieldname: 'custom_short_sleeves_rounding',
            fieldtype: 'Data'
        },
       
        // Neck Section
        {
            label: 'Neck Measurements',
            fieldname: 'neck_section',
            fieldtype: 'Section Break'
        },
        {
            label: 'Neck Depth F',
            fieldname: 'custom_neck_depth_f',
            fieldtype: 'Data'
        },
        {
            label: 'Neck Depth B',
            fieldname: 'custom_neck_depth_b',
            fieldtype: 'Data'
        },
        {
            fieldtype: 'Column Break'
        },
        {
            label: 'Straight Kurta Length',
            fieldname: 'custom_straight_kurta_length',
            fieldtype: 'Data'
        },
        {
            label: 'Kalli Kurta Length',
            fieldname: 'custom_kalli_kurta_length',
            fieldtype: 'Data'
        },
        {
            fieldtype: 'Column Break'
        },
        {
            label: 'Yoke Length',
            fieldname: 'custom_yoke_length',
            fieldtype: 'Data'
        },
       
        {
            label: 'OFF Shoulder Rounding',
            fieldname: 'custom_off_shoulder_rounding',
            fieldtype: 'Data'
        },
       
        // Final Section
        {
            label: 'Additional Measurements',
            fieldname: 'additional_section',
            fieldtype: 'Section Break'
        },
        {
            label: 'Waist Coat Length',
            fieldname: 'custom_waist_coat_length',
            fieldtype: 'Data'
        },
        {
            label: 'Nick Round',
            fieldname: 'custom_nick_round',
            fieldtype: 'Data'
        },
       
        {
            label: 'Short Jacket Length',
            fieldname: 'custom_short_jacket_length',
            fieldtype: 'Data'
        },
        {
            fieldtype: 'Column Break'
        },
        {
            label: 'Remarks',
            fieldname: 'custom_remarks_part',
            fieldtype: 'Long Text'
        }
    ];
 }
 
 

//  // In public/js/sales_order.js or custom app's sales_order.js

// frappe.ui.form.on('Sales Order', {
//     refresh: function(frm) {
//         // Apply styling to settings icon in item table
//         applySettingsIconStyling(frm);

//     },
    
//     // Also apply when the items table is updated
//     items_on_form_rendered: function(frm) {
//         applySettingsIconStyling(frm);
//     }
// });

// // Function to apply styling to settings icons
// function applySettingsIconStyling(frm) {
//     // Wait a bit for the grid to render
//     setTimeout(() => {
//         // Target the settings icons in the items table
//         let settingIcons = frm.fields_dict.items.grid.wrapper.querySelectorAll('.grid-row .col.col-1 svg use[href="#icon-setting-gear"]');
        
//         settingIcons.forEach(iconUse => {
//             const svg = iconUse.closest('svg');
//             const container = svg.closest('.col-1');
            
//             if (svg && container) {
//                 // Apply styles based on current screen width
//                 updateStylesBasedOnScreenSize(svg, container);
                
//                 // Add hover effect to the SVG
//                 svg.addEventListener('mouseover', function() {
//                     this.style.filter = 'opacity(1)';
//                 });
                
//                 svg.addEventListener('mouseout', function() {
//                     this.style.filter = 'opacity(0.5)';
//                 });
                
//                 // Store original reference to remember this has been processed
//                 container.dataset.styledSettingsIcon = 'true';
//             }
//         });
        
//         // Add window resize listener (only once)
//         if (!window._settingsIconResizeListenerAdded) {
//             window.addEventListener('resize', function() {
//                 const processedIcons = frm.fields_dict.items.grid.wrapper.querySelectorAll('.grid-row .col-1[data-styled-settings-icon="true"]');
                
//                 processedIcons.forEach(container => {
//                     const svg = container.querySelector('svg');
//                     if (svg) {
//                         updateStylesBasedOnScreenSize(svg, container);
//                     }
//                 });
//             });
            
//             window._settingsIconResizeListenerAdded = true;
//         }
//     }, 500);
// }

// // Function to update styles based on screen size
// function updateStylesBasedOnScreenSize(svg, container) {
//     // Apply base styles
//     container.style.cursor = 'pointer';
//     container.style.display = 'flex';
//     container.style.justifyContent = 'center';
//     container.style.transition = 'all 0.3s ease';
    
//     svg.style.filter = 'opacity(0.5)';
//     svg.style.transition = 'all 0.3s ease';
    
//     // Apply responsive styles based on screen width
//     const width = window.innerWidth;
    
//     if (width <= 576) {
//         // Extra small devices (phones)
//         container.style.width = '30px';
//         container.style.padding = '4px';
//         svg.style.width = '14px';
//         svg.style.height = '14px';
//     } 
//     else if (width <= 768) {
//         // Small devices (tablets)
//         container.style.width = '40px';
//         container.style.padding = '6px';
//         svg.style.width = '16px';
//         svg.style.height = '16px';
//     }
//     else if (width <= 992) {
//         // Medium devices (small laptops)
//         container.style.width = '50px';
//         container.style.padding = '8px';
//         svg.style.width = '18px';
//         svg.style.height = '18px';
//     }
//     else {
//         // Large devices (desktops)
//         container.style.width = '60px';
//         container.style.padding = '10px';
//         svg.style.width = '20px';
//         svg.style.height = '20px';
//     }
// }





// frappe.ui.form.on('Sales Order', {
//     onload: function(frm) {
//         console.log("function choleche");
        
//         const itmesheader=$('.grid-heading-row')
//         console.log("this is hitm",itmesheader);
        
//         frm.fields_dict['items'].grid.wrapper.find('.grid-heading-row').each(function() {
//             // Check if our custom button already exists
//             if ($(this).find('use[href="#icon-setting-gear"]').length) {
//                 // Create icon button (Font Awesome example)
//                 const boardIconBtn = $(`
//                     <button class="btn btn-default btn-xs board-icon-btn" title="Open Board">
//                         <i class="fa fa-th-large"></i>
//                     </button>
//                 `);

//                 // Add click behavior
//                 boardIconBtn.on('click', function() {
//                     frappe.msgprint('Board icon clicked!');
//                     // You can replace this with a call to a custom function
//                 });

//                 // Append it beside the settings icon
//                 $(this).prepend(boardIconBtn);
//             }
//         });
//     }
// });
