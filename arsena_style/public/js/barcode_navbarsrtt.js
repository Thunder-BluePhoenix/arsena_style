frappe.provide('frappe.barcode_scanner');

// Add enhanced CSS styles for barcode scanner
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
  
   /* Enhanced product info dialog styling */
   .product-info-dialog {
       width: 90vw !important;
       max-width: 1200px !important;
   }
   
   .product-info-dialog .modal-dialog {
       width: 100%;
       max-width: 1200px;
   }
   
   .product-info-dialog .modal-content {
       width: 100%;
       max-width: 1200px;
       overflow-x: auto; /* Add horizontal scroll for smaller screens */
   }
   
   .product-info-container {
       display: grid;
       grid-template-columns: 1fr 1fr;
       gap: 20px;
       min-width: 850px; /* Minimum width to ensure content doesn't get too compressed */
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
       grid-column: 1 / -1;
   }
   
   .product-info-left-panel {
       grid-column: 1;
   }
   
   .product-info-right-panel {
       grid-column: 2;
       height: 100%;
   }
  
   .product-info-dialog .gallery-container {
       position: relative;
       margin-bottom: 20px;
       display: flex;
       align-items: center;
       justify-content: center;
       gap: 15px;
       padding: 0 10px;
       width: 500px;
   }
   
   .product-info-dialog .product-gallery {
       width: 100%;
       overflow: hidden;
   }
   
   .product-info-dialog .gallery-scroll-btn {
       flex: 0 0 40px;
       width: 40px;
       height: 40px;
       border-radius: 50%;
       background: white;
       border: 1px solid var(--gray-300);
       display: flex;
       align-items: center;
       justify-content: center;
       cursor: pointer;
       z-index: 10;
       box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
   }
   
   .product-info-dialog .gallery-scroll-left {
       margin-right: 5px;
   }
   
   .product-info-dialog .gallery-scroll-right {
       margin-left: 5px;
   }
  
   .product-info-dialog .gallery-item {
       width: 100%;
       display: flex;
       flex-direction: column;
       align-items: center;
   }
   
   .product-info-dialog .gallery-item img {
       width: 100%;
       height: 240px;
       object-fit: contain;
       border-radius: var(--border-radius);
       border: 1px solid var(--gray-200);
   }
   
   .product-info-dialog .view-label {
       text-align: center;
       margin-top: 8px;
       color: var(--text-muted);
       font-size: var(--text-sm);
       width: 100%;
       text-transform: uppercase; /* Make view angle uppercase */
       font-weight: 500;
   }
  
   .product-info-dialog .gallery-wrapper {
       overflow: auto;
       width: 508px;
   }
   
   .product-info-dialog .gallery-slider {
       display: flex;
       transition: transform 0.3s ease;
       overflow-x: hidden;
       width: 850px;
       gap: 10px;
   }
  
   .product-info-dialog .materials-list {
       margin-top: 15px;
       border: 1px solid var(--gray-200);
       border-radius: var(--border-radius);
       overflow-y: auto; /* Add scroll for materials table */
       max-height: 300px;
   }
   
   .product-info-dialog .materials-table {
       width: 100%;
       border-collapse: collapse;
   }
   
   .product-info-dialog .materials-table th,
   .product-info-dialog .materials-table td {
       padding: 8px 12px;
       text-align: left;
       border-bottom: 1px solid var(--gray-200);
   }
   
   .product-info-dialog .materials-table th {
       background-color: var(--bg-light-gray);
       font-weight: bold;
       position: sticky;
       top: 0;
       z-index: 1;
   }
   
   .product-info-dialog .materials-table tr:last-child td {
       border-bottom: none;
   }
   
   .product-info-dialog .cost-details {
       display: flex;
       justify-content: space-between;
       align-items: center;
       padding: 10px 0;
       font-weight: bold;
   }
   
   .product-info-dialog .cost-value {
       font-size: 1.1em;
       color: var(--primary);
   }

   /* Ensure view angle is always visible */
   .product-info-dialog .gallery-item .view-label {
       display: block !important;
       visibility: visible !important;
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

   load_quagga() {
       // This is a placeholder - the function exists to maintain compatibility
       // with the existing implementation
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
       // Enhanced fetch to get complete product details
       frappe.db.get_list('Final Product', {
           fields: ['*'],
           filters: { 'barcode': barcode },
           limit: 1
       }).then(results => {
           if (results && results.length > 0) {
               // Fetch the complete doc to get child table data
               frappe.db.get_doc('Final Product', results[0].name)
                   .then(product => {
                       this.show_product_info(product);
                   });
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
       // Create enhanced product info dialog
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

       // Add custom class and show the dialog
       info_dialog.$wrapper.addClass('product-info-dialog');
       
       // Center the dialog in the viewport
       info_dialog.$wrapper.css({
           'position': 'fixed',
           'top': '50%',
           'left': '50%',
           'transform': 'translate(-50%, -50%)',
           'max-height': '90vh',
           'overflow-y': 'auto'
       });
       
       info_dialog.show();
   }

   get_product_html(product) {
       // Improved HTML display with two-column layout
       let html = `
       <div class="product-info-container">
           <div class="section-title">
               Barcode: ${frappe.utils.escape_html(product.barcode || '')} 
              
           </div>
           
           <div class="product-info-left-panel">
               <div class="section-title">Basic Information</div>
               <div class="product-details">
                   <div class="product-detail-item">
                       <div class="product-detail-label">Product Name</div>
                       <div class="product-detail-value">${frappe.utils.escape_html(product.product_name || '')}</div>
                   </div>
                   <div class="product-detail-item">
                       <div class="product-detail-label">Item Code</div>
                       <div class="product-detail-value">${frappe.utils.escape_html(product.item_code || 'None')}</div>
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
                       <div class="product-detail-value">${frappe.utils.escape_html(product.final_no_qty || 'None')}</div>
                   </div>
               </div>
               <div class="product-details">
               <div class="product-detail-item">
                       <div class="product-detail-label">Valuation</div>
                       <div class="product-detail-value">${frappe.utils.escape_html(product.valuation || 'None')}</div>
                   </div>
                   
                   
               </div>
       
               
               <div class="product-details">
    <div class="product-detail-item">
        <div class="product-detail-label">Product Description</div>
        <div class="product-detail-value">
            ${product.description || 'None'}
        </div>
    </div>
</div>




       `;

       // Add embroidery info if available2
       if (product.is_embroidery) {
           html += `
               <div class="section-title">Embroidery Information</div>
               <div class="product-details">
                   <div class="product-detail-item">
                       <div class="product-detail-label">Embroidery</div>
                       <div class="product-detail-value">${frappe.utils.escape_html(product.embroidery || '')}</div>
                   </div>
                   
               </div>
           `;
       }
       
       html += `</div>`; // Close left panel
       
       // Right panel with views and materials
       html += `
       <div class="product-info-right-panel">
           <div class="section-title">Product Views</div>
       `;
       
       // Add product views/images - show only one image at a time
       if (product.views && product.views.length > 0) {
           // Create a unique ID for this gallery
           const galleryId = `gallery-${Date.now()}`;
           
           html += `
           <div class="gallery-container">
               <button class="gallery-scroll-btn gallery-scroll-left" id="${galleryId}-prev">
                   <i class="fa fa-chevron-left"></i>
               </button>
               <div class="gallery-wrapper">
                   <div class="gallery-slider" id="${galleryId}-slider">
           `;
           
           product.views.forEach((view, index) => {
               html += `
               <div class="gallery-item" id="${galleryId}-item-${index}">
                   <img src="${view.image}" alt="${view.view_angle || 'Product View'}" />
                   <div class="view-label">${frappe.utils.escape_html((view.view_angle || '').toUpperCase())}</div>
               </div>
               `;
           });
           
           html += `
                   </div>
               </div>
               <button class="gallery-scroll-btn gallery-scroll-right" id="${galleryId}-next">
                   <i class="fa fa-chevron-right"></i>
               </button>
           </div>
           `;
           
           // Add script to handle gallery navigation - show one image at a time
           html += `
           <script>
               (function() {
                   // Wait for elements to be available
                   setTimeout(() => {
                       const slider = document.getElementById('${galleryId}-slider');
                       const prevBtn = document.getElementById('${galleryId}-prev');
                       const nextBtn = document.getElementById('${galleryId}-next');
                       
                       if (!slider || !prevBtn || !nextBtn) return;
                       
                       const items = Array.from(slider.querySelectorAll('.gallery-item'));
                       const itemCount = items.length;
                       let currentIndex = 0;
                       
                       // Set initial styles for proper display
                       slider.style.display = 'flex';
                       slider.style.width = '100%';
                       
                       // Initially hide all items except the first one
                       items.forEach((item, index) => {
                           item.style.flexShrink = 0;
                           item.style.flexGrow = 0;
                           item.style.width = '100%';
                           item.style.display = index === 0 ? 'block' : 'none';
                       });
                       
                       // Only show arrows if needed
                       if (itemCount <= 1) {
                           prevBtn.style.display = 'none';
                           nextBtn.style.display = 'none';
                       }
                       
                       prevBtn.addEventListener('click', () => {
                           items[currentIndex].style.display = 'none';
                           currentIndex = (currentIndex - 1 + itemCount) % itemCount;
                           items[currentIndex].style.display = 'block';
                           updateButtons();
                       });
                       
                       nextBtn.addEventListener('click', () => {
                           items[currentIndex].style.display = 'none';
                           currentIndex = (currentIndex + 1) % itemCount;
                           items[currentIndex].style.display = 'block';
                           updateButtons();
                       });
                       
                       function updateButtons() {
                           // Update button states if needed
                           // For a circular navigation, we don't need to disable buttons
                       }
                       
                       // Initial button state
                       updateButtons();
                   }, 100);
               })();
           </script>
           `;
       } else {
           html += `<p>No product images available.</p>`;
       }
       
       // Add materials table with vertical scroll
       html += `<div class="section-title">Materials</div>`;
       
       if (product.materials && product.materials.length > 0) {
           html += `
           <div class="materials-list">
               <table class="materials-table">
                   <thead>
                       <tr>
                           <th>Item Code</th>
                           <th>Item Name</th>
                           <th>Item Group</th>
                           <th>Group Type</th>
                       </tr>
                   </thead>
                   <tbody>
           `;
           
           product.materials.forEach(material => {
               html += `
               <tr>
                   <td>${frappe.utils.escape_html(material.item_code || '')}</td>
                   <td>${frappe.utils.escape_html(material.item_name || '')}</td>
                   <td>${frappe.utils.escape_html(material.item_group || '')}</td>
                   <td>${frappe.utils.escape_html(material.item_group_type || '')}</td>
               </tr>
               `;
           });
           
           html += `
                   </tbody>
               </table>
           </div>
           `;
       } else {
           html += `<p>No materials information available.</p>`;
       }
       
       html += `</div>`; // Close right panel
       
       html += `</div>`; // Close container
       
       return html;
   }
};

// Initialize barcode scanner when document is ready
$(document).ready(function() {
   frappe.barcode_scanner.instance = new frappe.barcode_scanner.BarcodeScanner();
});

