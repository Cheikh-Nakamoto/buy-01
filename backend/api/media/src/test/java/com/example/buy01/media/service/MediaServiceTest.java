package com.example.buy01.media.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.example.buy01.media.exception.ResourceNotFoundException;
import com.example.buy01.media.model.Media;
import com.example.buy01.media.repository.MediaRepository;
import com.example.buy01.media.utils.FileValidator;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.MockedStatic;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@SpringBootTest(classes = { MediaService.class })
@ExtendWith(SpringExtension.class)
class MediaServiceTest {

    @MockitoBean
    private MediaRepository mediaRepository;

    @MockitoBean
    private ProductClient productClient;

    @Autowired
    private MediaService mediaService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(mediaService, "UPLOAD_DIR", "/test/upload/");
        ReflectionTestUtils.setField(mediaService, "internalToken", "test-token");
    }

    /**
     * Test {@link MediaService#store(MultipartFile, String, String, String, String)}.
     *
     * <p>
     * Method under test:
     * {@link MediaService#store(MultipartFile, String, String, String, String)}
     */
    @Test
    @DisplayName("Test store(MultipartFile, String, String, String, String)")
    @Tag("ContributionFromDiffblue")
    void testStore() throws IOException {
        // Arrange
        String productId = "product123";
        String token = "";
        String email = "seller@example.org";
        String role = "ROLE_SELLER";
        
        MultipartFile file = new MockMultipartFile("image", "test.jpg", "image/jpeg", 
                "test image content".getBytes());
        
        Media savedMedia = new Media();
        savedMedia.setId("media123");
        savedMedia.setImagePath("/productsImages/test-uuid.jpg");
        savedMedia.setProductId(productId);
        
        List<Media> existingMedia = new ArrayList<>();
        
        when(productClient.validateProduct(productId, email)).thenReturn(true);
        when(mediaRepository.findByProductId(productId)).thenReturn(existingMedia);
        when(mediaRepository.save(any(Media.class))).thenReturn(savedMedia);
        
        // Mock the uploadAndgenerateFileName method to avoid file system operations
        MediaService spyMediaService = Mockito.spy(mediaService);
        Mockito.doReturn("test-uuid.jpg").when(spyMediaService).uploadAndgenerateFileName(file);
        
        try (MockedStatic<FileValidator> fileValidatorMock = Mockito.mockStatic(FileValidator.class)) {
            fileValidatorMock.when(() -> FileValidator.isValidImage(file)).thenReturn(true);
            
            // Act
            Media result = spyMediaService.store(file, productId, token, email, role);
            
            // Assert
            verify(mediaRepository).findByProductId(productId);
            verify(mediaRepository).save(any(Media.class));
            assertNotNull(result);
            assertEquals(productId, result.getProductId());
            assertTrue(result.getImagePath().startsWith("/productsImages/"));
        }
    }

    /**
     * Test {@link MediaService#store(MultipartFile, String, String, String, String)}.
     *
     * <ul>
     * <li>Given access denied.
     * <li>Then throw {@link AccessDeniedException}.
     * </ul>
     */
    @Test
    @DisplayName("Test store; given access denied; then throw AccessDeniedException")
    @Tag("ContributionFromDiffblue")
    void testStore_givenAccessDenied_thenThrowAccessDeniedException() throws IOException {
        // Arrange
        String productId = "product123";
        String token = "";
        String email = "unauthorized@example.org";
        String role = "ROLE_SELLER";
        
        MultipartFile file = new MockMultipartFile("image", "test.jpg", "image/jpeg", 
                "test image content".getBytes());
        
        when(productClient.validateProduct(productId, email)).thenReturn(false);
        
        // Act and Assert
        assertThrows(AccessDeniedException.class, 
                () -> mediaService.store(file, productId, token, email, role));
        verify(mediaRepository, never()).save(any(Media.class));
    }

    /**
     * Test {@link MediaService#store(MultipartFile, String, String, String, String)}.
     *
     * <ul>
     * <li>Given too many existing media (5 or more).
     * <li>Then throw {@link IllegalArgumentException}.
     * </ul>
     */
    @Test
    @DisplayName("Test store; given too many existing media; then throw IllegalArgumentException")
    @Tag("ContributionFromDiffblue")
    void testStore_givenTooManyExistingMedia_thenThrowIllegalArgumentException() throws IOException {
        // Arrange
        String productId = "product123";
        String token = "";
        String email = "seller@example.org";
        String role = "ROLE_SELLER";
        
        MultipartFile file = new MockMultipartFile("image", "test.jpg", "image/jpeg", 
                "test image content".getBytes());
        
        List<Media> existingMedia = new ArrayList<>();
        for (int i = 0; i < 5; i++) {
            Media media = new Media();
            media.setId("media" + i);
            existingMedia.add(media);
        }
        
        when(productClient.validateProduct(productId, email)).thenReturn(true);
        when(mediaRepository.findByProductId(productId)).thenReturn(existingMedia);
        
        // Act and Assert
        assertThrows(IllegalArgumentException.class, 
                () -> mediaService.store(file, productId, token, email, role));
        verify(mediaRepository, never()).save(any(Media.class));
    }

    /**
     * Test {@link MediaService#getMediaByProductId(String, String)}.
     *
     * <p>
     * Method under test: {@link MediaService#getMediaByProductId(String, String)}
     */
    @Test
    @DisplayName("Test getMediaByProductId(String, String)")
    @Tag("ContributionFromDiffblue")
    void testGetMediaByProductId() {
        // Arrange
        String productId = "product123";
        String token = "test-token";
        
        Media media1 = new Media();
        media1.setId("media1");
        media1.setImagePath("/productsImages/image1.jpg");
        media1.setProductId(productId);
        
        Media media2 = new Media();
        media2.setId("media2");
        media2.setImagePath("/productsImages/image2.jpg");
        media2.setProductId(productId);
        
        List<Media> mediaList = new ArrayList<>();
        mediaList.add(media1);
        mediaList.add(media2);
        
        when(mediaRepository.findByProductId(productId)).thenReturn(mediaList);
        
        // Act
        List<Media> result = mediaService.getMediaByProductId(productId, token);
        
        // Assert
        verify(mediaRepository).findByProductId(productId);
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("media1", result.get(0).getId());
        assertEquals("media2", result.get(1).getId());
    }

    /**
     * Test {@link MediaService#getMediaByProductId(String, String)}.
     *
     * <ul>
     * <li>Given no media found.
     * <li>Then return null.
     * </ul>
     */
    @Test
    @DisplayName("Test getMediaByProductId; given no media found; then return null")
    @Tag("ContributionFromDiffblue")
    void testGetMediaByProductId_givenNoMediaFound_thenReturnNull() {
        // Arrange
        String productId = "product123";
        String token = "test-token";
        
        when(mediaRepository.findByProductId(productId)).thenReturn(new ArrayList<>());
        
        // Act
        List<Media> result = mediaService.getMediaByProductId(productId, token);
        
        // Assert
        verify(mediaRepository).findByProductId(productId);
        assertEquals(null, result);
    }

    /**
     * Test {@link MediaService#deleteMedia(String, String, String, String)}.
     *
     * <p>
     * Method under test: {@link MediaService#deleteMedia(String, String, String, String)}
     */
    @Test
    @DisplayName("Test deleteMedia(String, String, String, String)")
    @Tag("ContributionFromDiffblue")
    void testDeleteMedia() {
        // Arrange
        String mediaId = "media123";
        String internalToken = "";
        String email = "seller@example.org";
        String role = "ROLE_SELLER";
        
        Media media = new Media();
        media.setId(mediaId);
        media.setImagePath("/productsImages/test.jpg");
        media.setProductId("product123");
        
        when(mediaRepository.findById(mediaId)).thenReturn(Optional.of(media));
        when(productClient.validateProduct("product123", email)).thenReturn(true);
        doNothing().when(mediaRepository).delete(media);
        
        // Act
        mediaService.deleteMedia(mediaId, internalToken, email, role);
        
        // Assert
        verify(mediaRepository).findById(mediaId);
        verify(mediaRepository).delete(media);
    }

    /**
     * Test {@link MediaService#deleteMedia(String, String, String, String)}.
     *
     * <ul>
     * <li>Given media not found.
     * <li>Then throw {@link ResourceNotFoundException}.
     * </ul>
     */
    @Test
    @DisplayName("Test deleteMedia; given media not found; then throw ResourceNotFoundException")
    @Tag("ContributionFromDiffblue")
    void testDeleteMedia_givenMediaNotFound_thenThrowResourceNotFoundException() {
        // Arrange
        String mediaId = "nonexistent";
        String internalToken = "";
        String email = "seller@example.org";
        String role = "ROLE_SELLER";
        
        when(mediaRepository.findById(mediaId)).thenReturn(Optional.empty());
        
        // Act and Assert
        assertThrows(ResourceNotFoundException.class, 
                () -> mediaService.deleteMedia(mediaId, internalToken, email, role));
        verify(mediaRepository).findById(mediaId);
        verify(mediaRepository, never()).delete(any(Media.class));
    }

    /**
     * Test {@link MediaService#deleteMedia(String, String, String, String)}.
     *
     * <ul>
     * <li>Given access denied.
     * <li>Then throw {@link AccessDeniedException}.
     * </ul>
     */
    @Test
    @DisplayName("Test deleteMedia; given access denied; then throw AccessDeniedException")
    @Tag("ContributionFromDiffblue")
    void testDeleteMedia_givenAccessDenied_thenThrowAccessDeniedException() {
        // Arrange
        String mediaId = "media123";
        String internalToken = "";
        String email = "unauthorized@example.org";
        String role = "ROLE_SELLER";
        
        Media media = new Media();
        media.setId(mediaId);
        media.setImagePath("/productsImages/test.jpg");
        media.setProductId("product123");
        
        when(mediaRepository.findById(mediaId)).thenReturn(Optional.of(media));
        when(productClient.validateProduct("product123", email)).thenReturn(false);
        
        // Act and Assert
        assertThrows(AccessDeniedException.class, 
                () -> mediaService.deleteMedia(mediaId, internalToken, email, role));
        verify(mediaRepository).findById(mediaId);
        verify(mediaRepository, never()).delete(any(Media.class));
    }

    /**
     * Test {@link MediaService#updateMedia(String, MultipartFile, String, String, String)}.
     *
     * <p>
     * Method under test: {@link MediaService#updateMedia(String, MultipartFile, String, String, String)}
     * @throws IOException 
     * @throws IllegalStateException 
     */
    @Test
    @DisplayName("Test updateMedia(String, MultipartFile, String, String, String)")
    @Tag("ContributionFromDiffblue")
    void testUpdateMedia() throws IllegalStateException, IOException {
        // Arrange
        String mediaId = "media123";
        String internalToken = "";
        String email = "seller@example.org";
        String role = "ROLE_SELLER";
        
        MultipartFile file = new MockMultipartFile("image", "updated.jpg", "image/jpeg", 
                "updated image content".getBytes());
        
        Media existingMedia = new Media();
        existingMedia.setId(mediaId);
        existingMedia.setImagePath("/productsImages/old.jpg");
        existingMedia.setProductId("product123");
        
        Media updatedMedia = new Media();
        updatedMedia.setId(mediaId);
        updatedMedia.setImagePath("/productsImages/updated-uuid.jpg");
        updatedMedia.setProductId("product123");
        
        when(mediaRepository.findById(mediaId)).thenReturn(Optional.of(existingMedia));
        when(productClient.validateProduct("product123", email)).thenReturn(true);
        when(mediaRepository.save(any(Media.class))).thenReturn(updatedMedia);
        
        // Mock the uploadAndgenerateFileName method to avoid file system operations
        MediaService spyMediaService = Mockito.spy(mediaService);
        Mockito.doReturn("updated-uuid.jpg").when(spyMediaService).uploadAndgenerateFileName(file);
        
        try (MockedStatic<FileValidator> fileValidatorMock = Mockito.mockStatic(FileValidator.class)) {
            fileValidatorMock.when(() -> FileValidator.isValidImage(file)).thenReturn(true);
            
            // Act
            Media result = spyMediaService.updateMedia(mediaId, file, internalToken, email, role);
            
            // Assert
            verify(mediaRepository).findById(mediaId);
            verify(mediaRepository).save(any(Media.class));
            assertNotNull(result);
            assertEquals(mediaId, result.getId());
        }
    }

    /**
     * Test {@link MediaService#updateMedia(String, MultipartFile, String, String, String)}.
     *
     * <ul>
     * <li>Given media not found.
     * <li>Then throw {@link ResourceNotFoundException}.
     * </ul>
     */
    @Test
    @DisplayName("Test updateMedia; given media not found; then throw ResourceNotFoundException")
    @Tag("ContributionFromDiffblue")
    void testUpdateMedia_givenMediaNotFound_thenThrowResourceNotFoundException() {
        // Arrange
        String mediaId = "nonexistent";
        String internalToken = "";
        String email = "seller@example.org";
        String role = "ROLE_SELLER";
        
        MultipartFile file = new MockMultipartFile("image", "test.jpg", "image/jpeg", 
                "test content".getBytes());
        
        when(mediaRepository.findById(mediaId)).thenReturn(Optional.empty());
        
        // Act and Assert
        assertThrows(ResourceNotFoundException.class, 
                () -> mediaService.updateMedia(mediaId, file, internalToken, email, role));
        verify(mediaRepository).findById(mediaId);
        verify(mediaRepository, never()).save(any(Media.class));
    }

    /**
     * Test {@link MediaService#validateProduct(String, String)}.
     *
     * <p>
     * Method under test: {@link MediaService#validateProduct(String, String)}
     */
    @Test
    @DisplayName("Test validateProduct(String, String)")
    @Tag("ContributionFromDiffblue")
    void testValidateProduct() {
        // Arrange
        String productId = "product123";
        String email = "seller@example.org";
        
        when(productClient.validateProduct(productId, email)).thenReturn(true);
        
        // Act
        boolean result = mediaService.validateProduct(productId, email);
        
        // Assert
        verify(productClient).validateProduct(productId, email);
        assertTrue(result);
    }

    /**
     * Test {@link MediaService#validateProduct(String, String)}.
     *
     * <ul>
     * <li>Given null product ID.
     * <li>Then throw {@link IllegalArgumentException}.
     * </ul>
     */
    @Test
    @DisplayName("Test validateProduct; given null product ID; then throw IllegalArgumentException")
    @Tag("ContributionFromDiffblue")
    void testValidateProduct_givenNullProductId_thenThrowIllegalArgumentException() {
        // Act and Assert
        assertThrows(IllegalArgumentException.class, 
                () -> mediaService.validateProduct(null, "seller@example.org"));
        verify(productClient, never()).validateProduct(anyString(), anyString());
    }

    /**
     * Test {@link MediaService#validateProduct(String, String)}.
     *
     * <ul>
     * <li>Given null email.
     * <li>Then throw {@link IllegalArgumentException}.
     * </ul>
     */
    @Test
    @DisplayName("Test validateProduct; given null email; then throw IllegalArgumentException")
    @Tag("ContributionFromDiffblue")
    void testValidateProduct_givenNullEmail_thenThrowIllegalArgumentException() {
        // Act and Assert
        assertThrows(IllegalArgumentException.class, 
                () -> mediaService.validateProduct("product123", null));
        verify(productClient, never()).validateProduct(anyString(), anyString());
    }

    /**
     * Test {@link MediaService#whichMake(String, String, String, String)}.
     *
     * <p>
     * Method under test: {@link MediaService#whichMake(String, String, String, String)}
     */
    @Test
    @DisplayName("Test whichMake(String, String, String, String)")
    @Tag("ContributionFromDiffblue")
    void testWhichMake() {
        // Arrange
        String productId = "product123";
        String token = "";
        String email = "seller@example.org";
        String role = "ROLE_SELLER";
        
        when(productClient.validateProduct(productId, email)).thenReturn(true);
        
        // Act
        boolean result = mediaService.whichMake(productId, token, email, role);
        
        // Assert
        verify(productClient).validateProduct(productId, email);
        assertTrue(result);
    }

    /**
     * Test {@link MediaService#whichMake(String, String, String, String)}.
     *
     * <ul>
     * <li>Given seller role but product validation fails.
     * <li>Then return false.
     * </ul>
     */
    @Test
    @DisplayName("Test whichMake; given seller role but product validation fails; then return false")
    @Tag("ContributionFromDiffblue")
    void testWhichMake_givenSellerRoleButValidationFails_thenReturnFalse() {
        // Arrange
        String productId = "product123";
        String token = "";
        String email = "unauthorized@example.org";
        String role = "ROLE_SELLER";
        
        when(productClient.validateProduct(productId, email)).thenReturn(false);
        
        // Act
        boolean result = mediaService.whichMake(productId, token, email, role);
        
        // Assert
        verify(productClient).validateProduct(productId, email);
        assertFalse(result);
    }

    /**
     * Test {@link MediaService#whichMake(String, String, String, String)}.
     *
     * <ul>
     * <li>Given non-empty token.
     * <li>Then return true without validation.
     * </ul>
     */
    @Test
    @DisplayName("Test whichMake; given non-empty token; then return true without validation")
    @Tag("ContributionFromDiffblue")
    void testWhichMake_givenNonEmptyToken_thenReturnTrueWithoutValidation() {
        // Arrange
        String productId = "product123";
        String token = "some-token";
        String email = "seller@example.org";
        String role = "ROLE_SELLER";
        
        // Act
        boolean result = mediaService.whichMake(productId, token, email, role);
        
        // Assert
        verify(productClient, never()).validateProduct(anyString(), anyString());
        assertTrue(result);
    }

    /**
     * Test {@link MediaService#uploadAndgenerateFileName(MultipartFile)}.
     *
     * <p>
     * Method under test: {@link MediaService#uploadAndgenerateFileName(MultipartFile)}
     */
    @Test
    @DisplayName("Test uploadAndgenerateFileName(MultipartFile)")
    @Tag("ContributionFromDiffblue")
    void testUploadAndGenerateFileName() throws IOException {
        // Arrange
        MultipartFile file = new MockMultipartFile("image", "test.jpg", "image/jpeg", 
                "test image content".getBytes());
        
        // Create a temporary directory for testing
        String tempDir = System.getProperty("java.io.tmpdir") + "/test-media-upload/";
        ReflectionTestUtils.setField(mediaService, "UPLOAD_DIR", tempDir);
        
        try (MockedStatic<FileValidator> fileValidatorMock = Mockito.mockStatic(FileValidator.class)) {
            fileValidatorMock.when(() -> FileValidator.isValidImage(file)).thenReturn(true);
            
            // Act
            String result = mediaService.uploadAndgenerateFileName(file);
            
            // Assert
            assertNotNull(result);
            assertTrue(result.endsWith(".jpg"));
            assertTrue(result.length() > 4); // UUID + extension
            
            // Clean up - delete the created file
            java.io.File createdFile = new java.io.File(tempDir + result);
            if (createdFile.exists()) {
                createdFile.delete();
            }
            // Clean up directory
            java.io.File dir = new java.io.File(tempDir);
            if (dir.exists()) {
                dir.delete();
            }
        }
    }

    /**
     * Test {@link MediaService#uploadAndgenerateFileName(MultipartFile)}.
     *
     * <ul>
     * <li>Given invalid file.
     * <li>Then throw {@link IllegalArgumentException}.
     * </ul>
     */
    @Test
    @DisplayName("Test uploadAndgenerateFileName; given invalid file; then throw IllegalArgumentException")
    @Tag("ContributionFromDiffblue")
    void testUploadAndGenerateFileName_givenInvalidFile_thenThrowIllegalArgumentException() {
        // Arrange
        MultipartFile file = new MockMultipartFile("image", "test.jpg", "image/jpeg", 
                "test image content".getBytes());
        
        try (MockedStatic<FileValidator> fileValidatorMock = Mockito.mockStatic(FileValidator.class)) {
            fileValidatorMock.when(() -> FileValidator.isValidImage(file)).thenReturn(false);
            
            // Act and Assert
            assertThrows(IllegalArgumentException.class, 
                    () -> mediaService.uploadAndgenerateFileName(file));
        }
    }

    /**
     * Test {@link MediaService#uploadAndgenerateFileName(MultipartFile)}.
     *
     * <ul>
     * <li>Given file with null name.
     * <li>Then throw {@link IllegalArgumentException}.
     * </ul>
     */
    @Test
    @DisplayName("Test uploadAndgenerateFileName; given file with null name; then throw IllegalArgumentException")
    @Tag("ContributionFromDiffblue")
    void testUploadAndGenerateFileName_givenFileWithNullName_thenThrowIllegalArgumentException() {
        // Arrange
        MultipartFile file = new MockMultipartFile("image", null, "image/jpeg", 
                "test image content".getBytes());
        
        try (MockedStatic<FileValidator> fileValidatorMock = Mockito.mockStatic(FileValidator.class)) {
            fileValidatorMock.when(() -> FileValidator.isValidImage(file)).thenReturn(true);
            
            // Act and Assert
            assertThrows(IllegalArgumentException.class, 
                    () -> mediaService.uploadAndgenerateFileName(file));
        }
    }

    /**
     * Test {@link MediaService#deleteMediaByProductId(String, String)}.
     *
     * <p>
     * Method under test: {@link MediaService#deleteMediaByProductId(String, String)}
     */
    @Test
    @DisplayName("Test deleteMediaByProductId(String, String)")
    @Tag("ContributionFromDiffblue")
    void testDeleteMediaByProductId() {
        // Arrange
        String productId = "product123";
        String token = "test-token";
        
        Media media1 = new Media();
        media1.setId("media1");
        media1.setImagePath("/productsImages/image1.jpg");
        media1.setProductId(productId);
        
        Media media2 = new Media();
        media2.setId("media2");
        media2.setImagePath("/productsImages/image2.jpg");
        media2.setProductId(productId);
        
        List<Media> mediaList = new ArrayList<>();
        mediaList.add(media1);
        mediaList.add(media2);
        
        when(mediaRepository.findByProductId(productId)).thenReturn(mediaList);
        doNothing().when(mediaRepository).delete(any(Media.class));
        
        // Act
        mediaService.deleteMediaByProductId(productId, token);
        
        // Assert
        verify(mediaRepository).findByProductId(productId);
        verify(mediaRepository, times(2)).delete(any(Media.class));
    }

    /**
     * Test {@link MediaService#deleteMediaByProductId(String, String)}.
     *
     * <ul>
     * <li>Given no media found for product.
     * <li>Then no deletion occurs.
     * </ul>
     */
    @Test
    @DisplayName("Test deleteMediaByProductId; given no media found for product; then no deletion occurs")
    @Tag("ContributionFromDiffblue")
    void testDeleteMediaByProductId_givenNoMediaFound_thenNoDeletionOccurs() {
        // Arrange
        String productId = "product123";
        String token = "test-token";
        
        when(mediaRepository.findByProductId(productId)).thenReturn(new ArrayList<>());
        
        // Act
        mediaService.deleteMediaByProductId(productId, token);
        
        // Assert
        verify(mediaRepository).findByProductId(productId);
        verify(mediaRepository, never()).delete(any(Media.class));
    }
}