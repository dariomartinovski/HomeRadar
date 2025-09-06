package com.home_radar.util

import com.home_radar.domain.Property

object EmailTemplateUtil {

    fun newPropertyTemplate(property: Property): String {
        return """
            <html>
              <head>
                <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; }
                  .card {
                      border: 1px solid #ddd;
                      border-radius: 8px;
                      padding: 16px;
                      margin: 16px 0;
                      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                  }
                  .price { color: green; font-size: 18px; font-weight: bold; }
                  .btn {
                      display: inline-block;
                      padding: 10px 16px;
                      margin-top: 12px;
                      color: #fff;
                      background-color: #007bff;
                      text-decoration: none;
                      border-radius: 4px;
                  }
                </style>
              </head>
              <body>
                <h2>New Property Alert</h2>
                <p>A new property has been listed near your subscribed area:</p>

                <div class="card">
                    <h3>${property.title}</h3>
                    <p><b>Address:</b> ${property.address}</p>
                    <p class="price">${property.price} €</p>
                    <p><b>Rooms:</b> ${property.numberOfRooms} | <b>Square meters:</b> ${property.squareMeters}</p>
                    <img src="${property.imageUrl ?: "http://localhost:4200/assets/images/sale_flat_small.jpg"}" alt="Property Image" style="max-width:100%; border-radius:8px;">
                    <br>
                    <a class="btn" href="http://localhost:4200">View Details</a>
                </div>
              </body>
            </html>
        """.trimIndent()
    }
}