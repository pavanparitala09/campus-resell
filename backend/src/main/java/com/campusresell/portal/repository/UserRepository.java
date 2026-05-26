package com.campusresell.portal.repository;

import com.campusresell.portal.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByCollegeEmail(String collegeEmail);
    boolean existsByCollegeEmail(String collegeEmail);
    long countByVerified(boolean verified);
}
