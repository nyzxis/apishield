from typing import Dict, Any, Optional
from fastapi import APIRouter, Header, Request, Response, HTTPException
from fastapi.responses import JSONResponse

mock_router = APIRouter(prefix="/api/mock", tags=["Mock Vulnerable API Playground"])

# Simulated in-memory database for mock targets
MOCK_ACCOUNTS = {
    "101": {
        "account_id": "101",
        "holder": "Alice Smith",
        "balance": 5420.50,
        "role": "customer",
        "email": "alice@mockbank.io",
        "tier": "gold",
    },
    "102": {
        "account_id": "102",
        "holder": "Bob Johnson",
        "balance": 98450.00,
        "role": "vip_investor",
        "email": "bob.vip@financials.com",
        "tier": "platinum",
    },
    "admin": {
        "account_id": "admin",
        "holder": "System Administrator",
        "balance": 1500000.00,
        "role": "superadmin",
        "email": "root@mockbank.io",
        "tier": "master",
    },
}

# 1. Broken Bank API - Demonstrates BOLA / IDOR (API1) & CORS Wildcard (API7)
@mock_router.get("/bank/account/{account_id}")
async def get_bank_account(account_id: str, request: Request, authorization: Optional[str] = Header(None)):
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": "true",
        "X-Debug-Environment": "Development-Staging-Build-v1.4",
    }
    
    # Vulnerability: Doesn't check if token matches account_id! (BOLA / IDOR)
    if account_id in MOCK_ACCOUNTS:
        return JSONResponse(
            content={
                "status": "success",
                "data": MOCK_ACCOUNTS[account_id],
                "authenticated_as": "101", # Pretend requester is 101, but viewing 102/admin!
                "warning": "API permits unauthorized object ID substitution (BOLA/IDOR)"
            },
            headers=headers
        )
    return JSONResponse(status_code=404, content={"error": "Account not found"}, headers=headers)

# 2. E-Commerce Store - Demonstrates Mass Assignment (API3) & Broken Property Auth
@mock_router.post("/store/order")
async def create_store_order(payload: Dict[str, Any], request: Request):
    # Vulnerability: Blindly copies all JSON properties into user session/order!
    order_id = "ORD-98214"
    role = payload.get("role", "customer")
    is_admin = payload.get("is_admin", False)
    discount = payload.get("discount_percent", 0)
    
    headers = {
        "X-Powered-By": "Express/4.17.1 (Legacy Internal Microservice)",
    }
    
    response_data = {
        "order_id": order_id,
        "item": payload.get("item", "Standard Hardware Key"),
        "quantity": payload.get("quantity", 1),
        "total_cost": 0 if discount == 100 else 49.99 * (1 - discount / 100),
        "applied_discount": f"{discount}%",
        "user_context": {
            "assigned_role": role,
            "is_admin": is_admin,
            "privileges": "ALL_PRIVILEGES" if is_admin or role == "admin" else "CUSTOMER"
        }
    }
    return JSONResponse(content=response_data, headers=headers)

# 3. Healthcare Patient Portal - Demonstrates Broken Auth (API2) & Debug Leak (API9)
@mock_router.get("/health/patients/{patient_id}")
async def get_patient_record(patient_id: str, authorization: Optional[str] = Header(None)):
    # Vulnerability: Accepts any token or missing token or alg=none!
    headers = {
        "X-Application-Debug": "true",
        "X-OpenAPI-Spec": "/api/mock/health/swagger.json"
    }
    
    # Simulates accepting unsigned/none token
    is_unauthenticated = not authorization or "Bearer" not in authorization or "none" in authorization.lower()
    
    return JSONResponse(
        content={
            "patient_id": patient_id,
            "name": "Jane Doe",
            "diagnosis": "Condition Code: C-884 (Confidential)",
            "prescriptions": ["Med-A 50mg", "Med-B 100mg"],
            "auth_status": "Bypassed / None Algorithm Accepted" if is_unauthenticated else "Verified",
            "audit_warning": "Sensitive Medical Records exposed via broken token verification"
        },
        headers=headers
    )

# 4. Hardened Enterprise API - Secure Benchmark Control
@mock_router.get("/enterprise/secure")
async def get_secure_enterprise_data(authorization: Optional[str] = Header(None)):
    if not authorization or authorization != "Bearer apishield_prod_valid_token_2026":
        return JSONResponse(
            status_code=401,
            content={"error": "Unauthorized: Valid signed production Bearer token required"},
            headers={
                "WWW-Authenticate": "Bearer error=\"invalid_token\"",
                "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
                "X-Content-Type-Options": "nosniff",
                "X-Frame-Options": "DENY",
                "Content-Security-Policy": "default-src 'self'",
                "X-RateLimit-Limit": "100",
                "X-RateLimit-Remaining": "99",
            }
        )
    return JSONResponse(
        content={"status": "ok", "message": "Enterprise gateway access verified", "environment": "production"},
        headers={
            "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
            "X-RateLimit-Limit": "100",
            "X-RateLimit-Remaining": "99",
        }
    )
