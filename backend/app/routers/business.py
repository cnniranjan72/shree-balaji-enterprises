from fastapi import APIRouter
from .. import schemas
from ..config import get_settings

router = APIRouter(prefix="/business", tags=["business"])

@router.get("", response_model=schemas.BusinessInfo)
def get_business_info():
    settings = get_settings()
    return schemas.BusinessInfo(
        name=settings.business_name,
        address=settings.business_address,
        gstin=settings.business_gstin,
        phone=settings.business_phone,
        bank_name=settings.business_bank_name,
        account_number=settings.business_account_number,
        ifsc=settings.business_ifsc,
        branch=settings.business_branch
    )
