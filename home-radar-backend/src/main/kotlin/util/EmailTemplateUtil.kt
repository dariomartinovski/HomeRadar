package com.home_radar.util

import com.home_radar.domain.Property

object EmailTemplateUtil {
    fun newPropertyTemplate(property: Property): String {
        return """
            <html>
              <head>
                <style>
                  body { 
                      font-family: Arial, sans-serif; 
                      line-height: 1.6; 
                      margin: 0; 
                      padding: 0; 
                      background-color: #f4f4f4;
                  }
                  .container {
                      max-width: 600px;
                      margin: 20px auto;
                      background: #ffffff;
                      border-radius: 8px;
                      overflow: hidden;
                      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                  }
                  .header {
                      background: #007bff;
                      color: #ffffff;
                      padding: 16px;
                      text-align: center;
                  }
                  .header h2 {
                      margin: 0;
                      font-size: 22px;
                  }
                  .content {
                      padding: 20px;
                  }
                  .property-title {
                      margin: 0 0 10px;
                      font-size: 20px;
                      color: #2c3e50;
                  }
                  .price { 
                      color: #28a745; 
                      font-size: 18px; 
                      font-weight: bold; 
                      margin: 8px 0;
                  }
                  .details p {
                      margin: 4px 0;
                      font-size: 14px;
                      color: #555;
                  }
                  .property-image {
                      width: 100%;
                      max-height: 300px;
                      object-fit: cover;
                      border-radius: 6px;
                      margin: 12px 0;
                  }
                  .btn {
                      display: inline-block;
                      padding: 12px 20px;
                      margin-top: 12px;
                      background-color: #007bff;
                      color: #ffffff !important;
                      text-decoration: none;
                      font-size: 16px;
                      border-radius: 6px;
                      text-align: center;
                  }
                  .footer {
                      padding: 16px;
                      font-size: 12px;
                      color: #999;
                      text-align: center;
                      border-top: 1px solid #eee;
                  }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h2>New Property Alert</h2>
                  </div>
                  <div class="content">
                    <p>A new property has been listed near your subscribed area:</p>
                    
                    <h3 class="property-title">${property.title}</h3>
                    <div class="price">${property.price} €</div>
                    
                    <div class="details">
                      <p><b>Address:</b> ${property.address}</p>
                      <p><b>Rooms:</b> ${property.numberOfRooms} | <b>Size:</b> ${property.squareMeters} m²</p>
                    </div>
                                        
                    <a class="btn" href="http://localhost:4200/property/${property.id}">View Details</a>
                  </div>
                  <div class="footer">
                    You are receiving this email because you subscribed to property alerts.
                  </div>
                </div>
              </body>
            </html>
        """.trimIndent()
    }
}
