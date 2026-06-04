package com.example.inventory.repository;

import com.example.inventory.entity.AuditSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditSessionRepository extends JpaRepository<AuditSession, String> {
}
