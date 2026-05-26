package com.campusresell.portal.repository;

import com.campusresell.portal.model.EmailVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmailVerificationRepository extends JpaRepository<EmailVerification, String> {
}
