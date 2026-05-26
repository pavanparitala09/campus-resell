package com.campusresell.portal.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Value("${app.cloudinary.url:}")
    private String cloudinaryUrl;

    private Path fileStorageLocation;
    private Cloudinary cloudinary;

    @PostConstruct
    public void init() {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create directory for file uploads.", ex);
        }

        if (cloudinaryUrl != null && !cloudinaryUrl.isBlank()) {
            try {
                this.cloudinary = new Cloudinary(cloudinaryUrl);
            } catch (Exception e) {
                throw new RuntimeException("Could not initialize Cloudinary with the provided URL", e);
            }
        }
    }

    public String storeFile(MultipartFile file) {
        if (cloudinary != null) {
            try {
                Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.emptyMap());
                return (String) uploadResult.get("secure_url");
            } catch (IOException ex) {
                throw new RuntimeException("Could not upload file to Cloudinary. Please try again!", ex);
            }
        }

        // Fallback to local storage if Cloudinary is not configured
        String originalFileName = file.getOriginalFilename();
        String extension = "";
        if (originalFileName != null && originalFileName.contains(".")) {
            extension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }
        
        // Generate a random unique name
        String fileName = UUID.randomUUID().toString() + extension;

        try {
            if (fileName.contains("..")) {
                throw new RuntimeException("Filename contains invalid path sequence " + fileName);
            }

            Path targetLocation = this.fileStorageLocation.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            // Return relative access path
            return "/uploads/" + fileName;
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file locally: " + fileName + ". Please try again!", ex);
        }
    }
}
