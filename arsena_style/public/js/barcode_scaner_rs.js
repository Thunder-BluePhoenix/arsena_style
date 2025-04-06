frappe.provide('frappe.barcode_scanner');

// Add CSS styles for barcode scanner
const style = document.createElement('style');
style.textContent = `
    .barcode-scanner-wrapper {
        display: inline-flex;
        align-items: center;
        margin-left: 10px;
        position: relative;
    }

    .barcode-scanner-wrapper .btn {
        height: 28px;
        padding: 4px 8px;
        border: 1px solid var(--gray-300);
        background-color: var(--bg-color);
        color: var(--text-color);
        font-size: var(--text-sm);
        border-radius: var(--border-radius);
        display: inline-flex;
        align-items: center;
        gap: 6px;
    }

    .barcode-scanner-wrapper .btn:hover {
        background-color: var(--bg-light-gray);
    }

    .barcode-scanner-wrapper .scan-icon {
        color: var(--text-muted);
        font-size: 14px;
    }
    
    .barcode-scan-dialog .webcam-container {
        width: 100%;
        margin-bottom: 15px;
    }
    
    .barcode-scan-dialog video {
        width: 100%;
        height: auto;
        border-radius: var(--border-radius-md);
        background-color: var(--gray-900);
    }
    
    .barcode-scan-dialog .scan-controls {
        display: flex;
        justify-content: space-between;
        margin-top: 10px;
    }
    
    .product-info-dialog {
        max-width: 600px;
    }
    
    .product-info-dialog .product-details {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 15px;
        margin-bottom: 20px;
    }
    
    .product-info-dialog .product-detail-item {
        margin-bottom: 10px;
    }
    
    .product-info-dialog .product-detail-label {
        font-weight: bold;
        color: var(--text-muted);
        font-size: var(--text-sm);
        margin-bottom: 3px;
    }
    
    .product-info-dialog .product-detail-value {
        color: var(--text-color);
    }
    
    .product-info-dialog .section-title {
        font-size: var(--text-base);
        font-weight: bold;
        margin: 15px 0 10px 0;
        padding-bottom: 5px;
        border-bottom: 1px solid var(--gray-200);
    }
    
    .product-info-dialog .product-gallery {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-bottom: 15px;
    }
    
    .product-info-dialog .product-gallery img {
        width: 80px;
        height: 80px;
        object-fit: cover;
        border-radius: var(--border-radius);
        border: 1px solid var(--gray-200);
    }
    
    .product-info-dialog .materials-list {
        margin-top: 10px;
    }
    
    .product-info-dialog .materials-list .material-item {
        padding: 5px 0;
        border-bottom: 1px solid var(--gray-100);
    }
`;
document.head.appendChild(style);

frappe.barcode_scanner.BarcodeScanner = class BarcodeScanner {
    constructor() {
        this.setup();
    }

    setup() {
        this.create_barcode_button();
        this.bind_events();
        this.load_quagga();
    }

    create_barcode_button() {
        // Find the search bar container
        const $searchBar = $('.search-bar');
        
        this.$wrapper = $(`
            <div class="barcode-scanner-wrapper">
                <button class="btn btn-scan-barcode" type="button">
                    <i class="fa fa-barcode scan-icon"></i>
                    <span>Scan Barcode</span>
                </button>
            </div>
        `).insertAfter($searchBar);

        this.$scan_button = this.$wrapper.find('.btn-scan-barcode');
    }

    check_barcode_support() {
        return 'BarcodeDetector' in window;
    }

    bind_events() {
        // Handle scan button click
        this.$scan_button.on('click', () => {
            this.open_scanner_dialog();
        });
    }

    open_scanner_dialog() {
        // Check if BarcodeDetector is supported
        if (!this.check_barcode_support()) {
            // Fall back to manual entry if BarcodeDetector is not available
            this.open_manual_entry_dialog();
            return;
        }

        this.scan_dialog = new frappe.ui.Dialog({
            title: __('Scan Barcode'),
            fields: [
                {
                    fieldname: 'scanner_view',
                    fieldtype: 'HTML',
                    options: `
                        <div class="webcam-container">
                            <video id="video-scanner" style="width:100%; height:400px; object-fit:cover;"></video>
                        </div>
                        <div class="scan-message">
                            <p>Position the barcode in the center of the camera view.</p>
                        </div>
                        <div class="scan-controls">
                            <button class="btn btn-sm btn-default manual-entry">Enter Barcode Manually</button>
                            <button class="btn btn-sm btn-default cancel-scan">Cancel</button>
                        </div>
                    `
                },
            ],
            primary_action_label: __('Close Scanner'),
            primary_action: () => {
                this.stop_scanner();
                this.scan_dialog.hide();
            }
        });

        this.scan_dialog.fields_dict.scanner_view.$wrapper.find('.manual-entry').on('click', () => {
            // Stop scanner and open manual entry
            this.stop_scanner();
            this.scan_dialog.hide();
            this.open_manual_entry_dialog();
        });

        this.scan_dialog.fields_dict.scanner_view.$wrapper.find('.cancel-scan').on('click', () => {
            // Stop scanner and close dialog
            this.stop_scanner();
            this.scan_dialog.hide();
        });

        this.scan_dialog.$wrapper.addClass('barcode-scan-dialog');
        this.scan_dialog.show();

        // Initialize barcode scanner
        setTimeout(() => {
            this.start_barcode_detection();
        }, 200); // Short delay to ensure dialog is fully rendered
    }
    
    open_manual_entry_dialog() {
        const manual_dialog = new frappe.ui.Dialog({
            title: __('Enter Barcode'),
            fields: [
                {
                    fieldname: 'manual_barcode',
                    fieldtype: 'Data',
                    label: 'Enter Barcode Number',
                    reqd: 1
                }
            ],
            primary_action_label: __('Submit'),
            primary_action: () => {
                const barcode = manual_dialog.get_value('manual_barcode');
                manual_dialog.hide();
                this.handle_barcode_result(barcode);
            }
        });
        
        manual_dialog.show();
    }
    
    stop_scanner() {
        // Stop any existing video streams
        if (window.scannerStream) {
            window.scannerStream.getTracks().forEach(track => track.stop());
            window.scannerStream = null;
        }
    }

    async start_barcode_detection() {
        try {
            const barcodeDetector = new BarcodeDetector({ 
                formats: ['code_128', 'ean_13', 'ean_8', 'upc_a', 'upc_e'] 
            });
            
            // Get camera stream
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' } 
            });
            
            // Store stream for cleanup
            window.scannerStream = stream;
            
            // Get video element
            const video = document.getElementById('video-scanner');
            if (!video) {
                frappe.show_alert({
                    message: __('Video element not found. Please try again.'),
                    indicator: 'red'
                });
                this.scan_dialog.hide();
                return;
            }
            
            // Set up video
            video.srcObject = stream;
            video.setAttribute('playsinline', true);
            video.play();
            
            // Continuous detection function
            const detectBarcode = async () => {
                if (video.readyState === video.HAVE_ENOUGH_DATA) {
                    try {
                        const barcodes = await barcodeDetector.detect(video);
                        if (barcodes.length > 0) {
                            // Barcode found
                            const barcode = barcodes[0].rawValue;
                            
                            // Stop scanning
                            this.stop_scanner();
                            this.scan_dialog.hide();
                            
                            // Process barcode
                            this.handle_barcode_result(barcode);
                        } else {
                            // No barcode detected, continue scanning
                            requestAnimationFrame(detectBarcode);
                        }
                    } catch (err) {
                        console.error('Barcode detection error:', err);
                        requestAnimationFrame(detectBarcode);
                    }
                } else {
                    // Video not ready yet, keep trying
                    requestAnimationFrame(detectBarcode);
                }
            };
            
            // Start detection
            detectBarcode();
            
        } catch (err) {
            console.error('Camera access error:', err);
            frappe.show_alert({
                message: __('Error accessing camera: ') + err.message,
                indicator: 'red'
            });
            
            // Fall back to manual entry
            this.stop_scanner();
            this.scan_dialog.hide();
            this.open_manual_entry_dialog();
        }
    }

    handle_barcode_result(barcode) {
        if (!barcode) return;
        
        frappe.show_alert({
            message: __('Barcode detected: {0}', [barcode]),
            indicator: 'blue'
        });

        // Fetch product data based on barcode
        this.fetch_product_data(barcode);
    }

    fetch_product_data(barcode) {
        frappe.db.get_list('Final Product', {
            fields: ['*'],
            filters: { 'barcode': barcode },
            limit: 1
        }).then(results => {
            if (results && results.length > 0) {
                this.show_product_info(results[0]);
            } else {
                frappe.show_alert({
                    message: __('No product found with barcode: {0}', [barcode]),
                    indicator: 'red'
                });
            }
        }).catch(error => {
            console.error('Error fetching product data:', error);
            frappe.show_alert({
                message: __('Error fetching product data'),
                indicator: 'red'
            });
        });
    }

    show_product_info(product) {
        // Format product data for display
        const info_dialog = new frappe.ui.Dialog({
            title: __('Product Information'),
            fields: [
                {
                    fieldname: 'product_info',
                    fieldtype: 'HTML',
                    options: this.get_product_html(product)
                }
            ],
            primary_action_label: __('View Document'),
            primary_action: () => {
                // Open the product document
                frappe.set_route('Form', 'Final Product', product.name);
                info_dialog.hide();
            }
        });

        info_dialog.$wrapper.addClass('product-info-dialog');
        info_dialog.show();
    }

    get_product_html(product) {
        // Create HTML display of product data
        let html = `
        <div class="product-info-container">
            <div class="section-title">Basic Information</div>
            <div class="product-details">
                <div class="product-detail-item">
                    <div class="product-detail-label">Product Name</div>
                    <div class="product-detail-value">${frappe.utils.escape_html(product.product_name || '')}</div>
                </div>
                <div class="product-detail-item">
                    <div class="product-detail-label">Item Code</div>
                    <div class="product-detail-value">${frappe.utils.escape_html(product.item_code || '')}</div>
                </div>
                <div class="product-detail-item">
                    <div class="product-detail-label">Collection</div>
                    <div class="product-detail-value">${frappe.utils.escape_html(product.collection_name || '')}</div>
                </div>
                <div class="product-detail-item">
                    <div class="product-detail-label">Style No</div>
                    <div class="product-detail-value">${frappe.utils.escape_html(product.style_no || '')}</div>
                </div>
                <div class="product-detail-item">
                    <div class="product-detail-label">Season</div>
                    <div class="product-detail-value">${frappe.utils.escape_html(product.season || '')}</div>
                </div>
                <div class="product-detail-item">
                    <div class="product-detail-label">Size</div>
                    <div class="product-detail-value">${frappe.utils.escape_html(product.size || '')}</div>
                </div>
                <div class="product-detail-item">
                    <div class="product-detail-label">Color</div>
                    <div class="product-detail-value">${frappe.utils.escape_html(product.color || '')}</div>
                </div>
                <div class="product-detail-item">
                    <div class="product-detail-label">Final No/Qty</div>
                    <div class="product-detail-value">${frappe.utils.escape_html(product.final_no_qty || '')}</div>
                </div>
            </div>
        `;

        // Add product slug
        html += `
            <div class="section-title">Production Info</div>
            <div class="product-details">
                <div class="product-detail-item">
                    <div class="product-detail-label">Product Slug</div>
                    <div class="product-detail-value">${frappe.utils.escape_html(product.product_slug || '')}</div>
                </div>
                <div class="product-detail-item">
                    <div class="product-detail-label">BOM ID</div>
                    <div class="product-detail-value">${frappe.utils.escape_html(product.bom_id || '')}</div>
                </div>
                <div class="product-detail-item">
                    <div class="product-detail-label">Work Order</div>
                    <div class="product-detail-value">${frappe.utils.escape_html(product.work_order || '')}</div>
                </div>
                <div class="product-detail-item">
                    <div class="product-detail-label">Cost Sheet</div>
                    <div class="product-detail-value">${frappe.utils.escape_html(product.cost_sheet || '')}</div>
                </div>
                <div class="product-detail-item">
                    <div class="product-detail-label">Total Cost</div>
                    <div class="product-detail-value">${frappe.format(product.total_cost, {fieldtype: 'Currency'})}</div>
                </div>
            </div>
        `;

        // Add embroidery info if available
        if (product.is_embroidery) {
            html += `
                <div class="section-title">Embroidery Information</div>
                <div class="product-details">
                    <div class="product-detail-item">
                        <div class="product-detail-label">Embroidery</div>
                        <div class="product-detail-value">${frappe.utils.escape_html(product.embroidery || '')}</div>
                    </div>
                    <div class="product-detail-item">
                        <div class="product-detail-label">Embroidery No</div>
                        <div class="product-detail-value">${frappe.utils.escape_html(product.embroidery_no || '')}</div>
                    </div>
                </div>
            `;
        }
        
        // Close container
        html += `</div>`;
        
        return html;
    }
}

// Initialize barcode scanner when document is ready
$(document).ready(function() {
    frappe.barcode_scanner.instance = new frappe.barcode_scanner.BarcodeScanner();
});

