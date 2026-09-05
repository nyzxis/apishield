import os
import json
from datetime import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy import create_engine, Column, Integer, String, Text, Float, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker, Session

DATABASE_URL = os.getenv("DATABASE_URL")

# Resilience: support PostgreSQL when available, fallback to local/in-memory SQLite
engine = None
if DATABASE_URL:
    try:
        # Standardize postgres:// to postgresql:// for SQLAlchemy
        if DATABASE_URL.startswith("postgres://"):
            DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
        engine = create_engine(DATABASE_URL, pool_pre_ping=True)
        # Test connection
        with engine.connect() as conn:
            pass
    except Exception as e:
        print(f"[APIShield DB] Warning: PostgreSQL connection failed ({e}). Falling back to local SQLite.")
        engine = None

if engine is None:
    db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "apishield.db")
    engine = create_engine(f"sqlite:///{db_path}", connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class ScanAudit(Base):
    __tablename__ = "scan_audits"

    id = Column(Integer, primary_key=True, index=True)
    target_url = Column(String(500), nullable=False)
    http_method = Column(String(10), default="GET")
    overall_score = Column(Integer, default=100)
    risk_level = Column(String(50), default="LOW")
    grade = Column(String(5), default="A+")
    total_findings = Column(Integer, default=0)
    findings_json = Column(Text, default="[]")
    raw_response_status = Column(Integer, nullable=True)
    latency_ms = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def save_scan_audit(report: Dict[str, Any]) -> Optional[int]:
    try:
        db = SessionLocal()
        record = ScanAudit(
            target_url=report.get("target_url", "https://api.local"),
            http_method=report.get("http_method", "GET"),
            overall_score=report.get("score", 100),
            risk_level=report.get("risk_level", "LOW"),
            grade=report.get("grade", "A+"),
            total_findings=len(report.get("findings", [])),
            findings_json=json.dumps(report.get("findings", [])),
            raw_response_status=report.get("response_status", 200),
            latency_ms=report.get("latency_ms", 0.0),
            created_at=datetime.utcnow(),
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        record_id = record.id
        db.close()
        return record_id
    except Exception as e:
        print(f"[APIShield DB] Save audit warning: {e}")
        return None

def get_audit_history(limit: int = 10) -> List[Dict[str, Any]]:
    try:
        db = SessionLocal()
        records = db.query(ScanAudit).order_by(ScanAudit.id.desc()).limit(limit).all()
        history = []
        for r in records:
            history.append({
                "id": r.id,
                "target_url": r.target_url,
                "http_method": r.http_method,
                "score": r.overall_score,
                "risk_level": r.risk_level,
                "grade": r.grade,
                "total_findings": r.total_findings,
                "latency_ms": r.latency_ms,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            })
        db.close()
        return history
    except Exception as e:
        print(f"[APIShield DB] Get history warning: {e}")
        return []
