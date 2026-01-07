Product & Maintenance API Documentation
Authentication
Base URL: https://api-dev.geosign.toknox.com


Header richiesto (eccetto /status):

 x-api-key: Dm6hNWqD0T64hBpvlwmOB3WC2cBEEmFAa2C3ETz4
Product Endpoints
1. Tokenize Product
URL: /product/create


Method: POST


Request Body:


{
  "qr_code": "string",
  "signal_type": "string",
  “signal_category”: string
  "production_year": “integer”,
  "shape": "string",
  "dimension": "string",
  "wl_code": "string",
  "support_material": "string",
  "support_thickness": "string",
  "fixation_class": "string",
  "fixation_method": "string",
  "created_by": "string"
}

Response Body:


{
  "status_code": 200,
  "message": "Product Successfully Created and Tokenized.",
  "payload": {
    "data": {
      "uuid": "string",
      "signal_type": "string",
      "asset_id": 123,
      "metadata_cid": "string"
    }
  }
}

Notes:


Creates a product, computes its SHA-256 digest, stores metadata on IPFS, and mints an Algorand asset.


Returns 400 if a product with the same SHA-256 already exists.



2. Get All Products
URL: /product


Method: GET


Response Body:


{
  "status_code": 200,
  "message": "Products Successfully retrieved.",
  "payload": {
    "data": [
      {
        "uuid": "string",
        "qr_code": "string",
        "signal_type": "string",
        "signal_category": "string",
        "production_year": 2025,
        "shape": "string",
        "dimension": "string",
        "wl_code": "string",
        "support_material": "string",
        "support_thickness": "string",
        "fixation_class": "string",
        "fixation_method": "string",
        "product_sha256": "string"
        "asset_id": "string",
        "metadata_cid": "string",
        "created_by": "string",
        "created_at": "string",
        "maintenances": [
          {
            "uuid": "string",
            "intervention_type": "string",
            "gps_lat": 12.345678,
            "gps_lng": 98.765432,
            "year": 2025,
            "poles_number": 5,
            "company_id": "string",
            "certificate_number": "string",
            "reason": "string",
            "notes": "string",
            "created_at": "string"
          }
        ]
      }
    ]
  }
}

Notes: Fetches all products in the database.



Maintenance Endpoints
1. Create Maintenance
URL: /maintenance/create


Method: POST


Request Body:


{
  "intervention_type": "string",
  "gps_lat": String(10)
  "gps_lng":String(10)
  "year": integer (optional),
  "poles_number": “integer” (optional),
  "company_id": "string",
  "certificate_number": "string",
  "reason": "string",
  "notes": "string",
  "product_uuid": "string"
}

Response Body:


{
  "status_code": 200,
  "message": "Maintenance Successfully created.",
  "payload": {
    "data": {
      "uuid": "string",
      "intervention_type": "string",
      "asset_id": “integer”,
      "metadata_cid": "string",
      "transaction_id": "string"
    }
  }
}

Notes:


Associates a maintenance record with a product by UUID.


Updates the product’s metadata CID and Algorand asset.


Returns 400 if the product does not exist or SHA-256 already exists.



2. Get All Maintenances
URL: /maintenance


Method: GET


Response Body:


{
  "status_code": 200,
  "message": "Maintenances Successfully retrieved.",
  "payload": {
    "data": [
      {
        "uuid": "string",
        "intervention_type": "string",
        "gps_lat": “float”,
        "gps_lng": “float”,
        "year": “integer”,
        "poles_number": “integer”,
        "company_id": "string",
        "certificate_number": "string",
        "reason": "string",
        "notes": "string",
        "created_at": "string"
      }
    ]
  }
}

Notes: Fetches all maintenance records in the database.
