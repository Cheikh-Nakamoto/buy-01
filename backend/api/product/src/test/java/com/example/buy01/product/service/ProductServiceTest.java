package com.example.buy01.product.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isA;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.example.buy01.product.dto.MediaDTO;
import com.example.buy01.product.dto.ProductCreateDTO;
import com.example.buy01.product.dto.ProductDTO;
import com.example.buy01.product.dto.ProductUpdateDTO;
import com.example.buy01.product.dto.UserDTO;
import com.example.buy01.product.exception.ResourceNotFoundException;
import com.example.buy01.product.model.Product;
import com.example.buy01.product.repository.ProductRepository;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.web.multipart.MultipartFile;

@SpringBootTest(classes = { ProductService.class })
@ExtendWith(SpringExtension.class)
class ProductServiceTest {

        @MockitoBean
        private UserClient userClient;

        @MockitoBean
        private MediaClient mediaClient;

        @MockitoBean
        private ValidateMethods validateMethods;

        @MockitoBean
        private ProductRepository productRepository;

        @Autowired
        private ProductService productService;

        /**
         * Test
         * {@link ProductService#createProduct(ProductCreateDTO, String, String, MultipartFile[])}.
         *
         * <p>
         * Method under test:
         * {@link ProductService#createProduct(ProductCreateDTO, String, String, MultipartFile[])}
         */
        @Test
        @DisplayName("Test createProduct(ProductCreateDTO, String, String, MultipartFile[])")
        @Tag("ContributionFromDiffblue")
        void testCreateProduct() throws IOException {
                // Arrange
                UserDTO userDTO = new UserDTO();
                userDTO.setId("user123");
                userDTO.setName("John Doe");
                userDTO.setEmail("john.doe@example.org");

                Product savedProduct = new Product();
                savedProduct.setId("product123");
                savedProduct.setName("Test Product");
                savedProduct.setDescription("Test Description");
                savedProduct.setPrice(99.99);
                savedProduct.setQuantity(10);
                savedProduct.setUserId("user123");

                MediaDTO mediaDTO = new MediaDTO();
                mediaDTO.setId("media123");
                mediaDTO.setImagePath("http://example.com/image.jpg");

                List<MediaDTO> mediaList = new ArrayList<>();
                mediaList.add(mediaDTO);

                when(userClient.getUserByEmail(anyString())).thenReturn(userDTO);
                when(productRepository.save(any(Product.class))).thenReturn(savedProduct);
                when(mediaClient.store(any(MultipartFile.class), anyString())).thenReturn(mediaDTO);

                ProductCreateDTO dto = new ProductCreateDTO(null, null, null, null, null);
                dto.setName("Test Product");
                dto.setDescription("Test Description");
                dto.setPrice(99.99);
                dto.setQuantity(10);
                dto.setUserId("user123");

                MultipartFile[] files = {
                                new MockMultipartFile("image", "test.jpg", "image/jpeg",
                                                "test image content".getBytes())
                };

                // Act
                ProductDTO result = productService.createProduct(dto, "john.doe@example.org", "ROLE_SELLER", files);

                // Assert
                verify(userClient).getUserByEmail("john.doe@example.org");
                verify(productRepository).save(isA(Product.class));
                verify(mediaClient).store(any(MultipartFile.class), anyString());
                assertEquals("product123", result.getId());
                assertEquals("Test Product", result.getName());
                assertEquals("John Doe", result.getSellerName());
                assertEquals(1, result.getImageUrls().size());
        }

        /**
         * Test
         * {@link ProductService#createProduct(ProductCreateDTO, String, String, MultipartFile[])}.
         *
         * <ul>
         * <li>Given too many files (more than 5).
         * <li>Then throw {@link IllegalArgumentException}.
         * </ul>
         */
        @Test
        @DisplayName("Test createProduct; given too many files; then throw IllegalArgumentException")
        @Tag("ContributionFromDiffblue")
        void testCreateProduct_givenTooManyFiles_thenThrowIllegalArgumentException() throws IOException {
                // Arrange
                UserDTO userDTO = new UserDTO();
                userDTO.setId("user123");
                userDTO.setName("John Doe");
                userDTO.setEmail("john.doe@example.org");

                when(userClient.getUserByEmail(anyString())).thenReturn(userDTO);

                ProductCreateDTO dto = new ProductCreateDTO(null, null, null, null, null);
                dto.setName("Test Product");
                dto.setDescription("Test Description");
                dto.setPrice(99.99);
                dto.setQuantity(10);
                dto.setUserId("user123");

                MultipartFile[] files = new MultipartFile[6]; // Plus de 5 fichiers
                for (int i = 0; i < 6; i++) {
                        files[i] = new MockMultipartFile("image" + i, "test" + i + ".jpg", "image/jpeg",
                                        "test content".getBytes());
                }

                // Act and Assert
                assertThrows(IllegalArgumentException.class,
                                () -> productService.createProduct(dto, "john.doe@example.org", "ROLE_SELLER", files));
                verify(userClient).getUserByEmail("john.doe@example.org");
        }

        /**
         * Test
         * {@link ProductService#createProduct(ProductCreateDTO, String, String, MultipartFile[])}.
         *
         * <ul>
         * <li>Given null user ID.
         * <li>Then throw {@link IllegalArgumentException}.
         * </ul>
         */
        @Test
        @DisplayName("Test createProduct; given null user ID; then throw IllegalArgumentException")
        @Tag("ContributionFromDiffblue")
        void testCreateProduct_givenNullUserId_thenThrowIllegalArgumentException() throws IOException {
                // Arrange
                UserDTO userDTO = new UserDTO();
                userDTO.setId("user123");
                userDTO.setName("John Doe");
                userDTO.setEmail("john.doe@example.org");

                when(userClient.getUserByEmail(anyString())).thenReturn(userDTO);

                ProductCreateDTO dto = new ProductCreateDTO(null, null, null, null, null);
                dto.setName("Test Product");
                dto.setDescription("Test Description");
                dto.setPrice(99.99);
                dto.setQuantity(10);
                dto.setUserId(null); // User ID null

                // Act and Assert
                assertThrows(IllegalArgumentException.class,
                                () -> productService.createProduct(dto, "john.doe@example.org", "ROLE_CLIENT", null));
                verify(userClient).getUserByEmail("john.doe@example.org");
        }

        /**
         * Test {@link ProductService#getAllProducts()}.
         *
         * <p>
         * Method under test: {@link ProductService#getAllProducts()}
         */
        @Test
        @DisplayName("Test getAllProducts()")
        @Tag("ContributionFromDiffblue")
        void testGetAllProducts() {
                // Arrange
                Product product1 = new Product();
                product1.setId("product1");
                product1.setName("Product 1");
                product1.setDescription("Description 1");
                product1.setPrice(50.00);
                product1.setQuantity(5);
                product1.setUserId("user1");

                Product product2 = new Product();
                product2.setId("product2");
                product2.setName("Product 2");
                product2.setDescription("Description 2");
                product2.setPrice(75.00);
                product2.setQuantity(3);
                product2.setUserId("user2");

                List<Product> products = new ArrayList<>();
                products.add(product1);
                products.add(product2);

                when(productRepository.findAll()).thenReturn(products);
                doNothing().when(validateMethods).validateObjectId(anyString());
                when(productRepository.findById("product1")).thenReturn(Optional.of(product1));
                when(productRepository.findById("product2")).thenReturn(Optional.of(product2));
                when(userClient.getSellerNameById("user1")).thenReturn("Seller 1");
                when(userClient.getSellerNameById("user2")).thenReturn("Seller 2");
                when(mediaClient.getMediasByProductId(anyString())).thenReturn(new ArrayList<>());

                // Act
                List<ProductDTO> result = productService.getAllProducts();

                // Assert
                verify(productRepository).findAll();
                assertEquals(2, result.size());
                assertEquals("product1", result.get(0).getId());
                assertEquals("product2", result.get(1).getId());
        }

        /**
         * Test {@link ProductService#getAllProducts()}.
         *
         * <ul>
         * <li>Given empty product list.
         * <li>Then return empty list.
         * </ul>
         */
        @Test
        @DisplayName("Test getAllProducts; given empty product list; then return empty list")
        @Tag("ContributionFromDiffblue")
        void testGetAllProducts_givenEmptyProductList_thenReturnEmptyList() {
                // Arrange
                when(productRepository.findAll()).thenReturn(new ArrayList<>());

                // Act
                List<ProductDTO> result = productService.getAllProducts();

                // Assert
                verify(productRepository).findAll();
                assertTrue(result.isEmpty());
        }

        /**
         * Test {@link ProductService#getProductById(String)}.
         *
         * <p>
         * Method under test: {@link ProductService#getProductById(String)}
         */
        @Test
        @DisplayName("Test getProductById(String)")
        @Tag("ContributionFromDiffblue")
        void testGetProductById() {
                // Arrange
                String productId = "product123";
                String userId = "user123";
                Product product = new Product();
                product.setId(productId);
                product.setName("Test Product");
                product.setDescription("Test Description");
                product.setPrice(99.99);
                product.setQuantity(10);
                product.setUserId(userId);

                MediaDTO mediaDTO = new MediaDTO();
                mediaDTO.setId("media123");
                mediaDTO.setImagePath("http://example.com/image.jpg");
                List<MediaDTO> mediaList = new ArrayList<>();
                mediaList.add(mediaDTO);

                doNothing().when(validateMethods).validateObjectId(productId);
                when(productRepository.findById(productId)).thenReturn(Optional.of(product));
                when(userClient.getSellerNameById(userId)).thenReturn("John Doe");
                when(mediaClient.getMediasByProductId(productId)).thenReturn(mediaList);

                // Act
                ProductDTO result = productService.getProductById(productId);

                // Assert
                verify(validateMethods).validateObjectId(productId);
                verify(productRepository).findById(productId);
                verify(userClient).getSellerNameById(userId);
                verify(mediaClient).getMediasByProductId(productId);
                assertEquals(productId, result.getId());
                assertEquals("Test Product", result.getName());
                assertEquals("John Doe", result.getSellerName());
                assertEquals(1, result.getImageUrls().size());
        }

        /**
         * Test {@link ProductService#getProductById(String)}.
         *
         * <ul>
         * <li>Given product not found.
         * <li>Then throw {@link ResourceNotFoundException}.
         * </ul>
         */
        @Test
        @DisplayName("Test getProductById; given product not found; then throw ResourceNotFoundException")
        @Tag("ContributionFromDiffblue")
        void testGetProductById_givenProductNotFound_thenThrowResourceNotFoundException() {
                // Arrange
                doNothing().when(validateMethods).validateObjectId("nonexistent");
                when(productRepository.findById("nonexistent")).thenReturn(Optional.empty());

                // Act and Assert
                assertThrows(ResourceNotFoundException.class,
                                () -> productService.getProductById("nonexistent"));
                verify(validateMethods).validateObjectId("nonexistent");
                verify(productRepository).findById("nonexistent");
        }

        /**
         * Test
         * {@link ProductService#updateProduct(String, ProductUpdateDTO, String, String)}.
         *
         * <p>
         * Method under test:
         * {@link ProductService#updateProduct(String, ProductUpdateDTO, String, String)}
         */
        @Test
        @DisplayName("Test updateProduct(String, ProductUpdateDTO, String, String)")
        @Tag("ContributionFromDiffblue")
        void testUpdateProduct() {
                // Arrange
                String userId = "user123";
                String productId = "product123";
                UserDTO userDTO = new UserDTO();
                userDTO.setId(userId);
                userDTO.setName("John Doe");
                userDTO.setEmail("john.doe@example.org");

                Product existingProduct = new Product();
                existingProduct.setId(productId);
                existingProduct.setName("Old Product");
                existingProduct.setDescription("Old Description");
                existingProduct.setPrice(50.00);
                existingProduct.setQuantity(5);
                existingProduct.setUserId(userId);

                Product updatedProduct = new Product();
                updatedProduct.setId(productId);
                updatedProduct.setName("Updated Product");
                updatedProduct.setDescription("Updated Description");
                updatedProduct.setPrice(75.00);
                updatedProduct.setQuantity(8);
                updatedProduct.setUserId(userId);

                ProductUpdateDTO updateDTO = new ProductUpdateDTO();
                updateDTO.setName("Updated Product");
                updateDTO.setDescription("Updated Description");
                updateDTO.setPrice(75.00);
                updateDTO.setQuantity(8);

                doNothing().when(validateMethods).validateObjectId(productId);
                when(userClient.getUserByEmail("john.doe@example.org")).thenReturn(userDTO);
                when(productRepository.findById(productId)).thenReturn(Optional.of(existingProduct));
                when(productRepository.save(any(Product.class))).thenReturn(updatedProduct);
                when(userClient.getSellerNameById(userId)).thenReturn("John Doe");
                when(mediaClient.getMediasByProductId(productId)).thenReturn(new ArrayList<>());

                // Act
                ProductDTO result = productService.updateProduct(productId, updateDTO, "john.doe@example.org",
                                "ROLE_SELLER");

                // Assert
                verify(validateMethods, times(2)).validateObjectId(productId); // Appelé par updateProduct et getProductById
                verify(userClient).getUserByEmail("john.doe@example.org");
                verify(productRepository, times(2)).findById(productId); // Appelé par updateProduct et getProductById
                verify(productRepository).save(any(Product.class));
                assertEquals(productId, result.getId());
                assertEquals("Updated Product", result.getName());
        }

        /**
         * Test
         * {@link ProductService#updateProduct(String, ProductUpdateDTO, String, String)}.
         *
         * <ul>
         * <li>Given unauthorized user.
         * <li>Then throw {@link IllegalArgumentException}.
         * </ul>
         */
        @Test
        @DisplayName("Test updateProduct; given unauthorized user; then throw IllegalArgumentException")
        @Tag("ContributionFromDiffblue")
        void testUpdateProduct_givenUnauthorizedUser_thenThrowIllegalArgumentException() {
                // Arrange
                String userId = "user456";
                String productId = "product123";
                UserDTO userDTO = new UserDTO();
                userDTO.setId(userId); // Différent utilisateur
                userDTO.setName("Jane Doe");
                userDTO.setEmail("jane.doe@example.org");

                Product existingProduct = new Product();
                existingProduct.setId(productId);
                existingProduct.setName("Test Product");
                existingProduct.setUserId("user999"); // Appartient à un autre utilisateur

                ProductUpdateDTO updateDTO = new ProductUpdateDTO();
                updateDTO.setName("Updated Product");

                doNothing().when(validateMethods).validateObjectId(productId);
                when(userClient.getUserByEmail("jane.doe@example.org")).thenReturn(userDTO);
                when(productRepository.findById(productId)).thenReturn(Optional.of(existingProduct));

                // Act and Assert
                assertThrows(IllegalArgumentException.class,
                                () -> productService.updateProduct(productId, updateDTO, "jane.doe@example.org",
                                                "ROLE_CLIENT"));
                verify(validateMethods).validateObjectId(productId);
                verify(userClient).getUserByEmail("jane.doe@example.org");
                verify(productRepository).findById(productId);
        }

        /**
         * Test {@link ProductService#deleteProduct(String, String, String)}.
         *
         * <p>
         * Method under test:
         * {@link ProductService#deleteProduct(String, String, String)}
         */
        @Test
        @DisplayName("Test deleteProduct(String, String, String)")
        @Tag("ContributionFromDiffblue")
        void testDeleteProduct() {
                // Arrange
                String userId = "user123";
                String productId = "product123";
                UserDTO userDTO = new UserDTO();
                userDTO.setId(userId);
                userDTO.setName("John Doe");
                userDTO.setEmail("john.doe@example.org");

                Product product = new Product();
                product.setId(productId);
                product.setName("Test Product");
                product.setUserId(userId);

                when(userClient.getUserByEmail("john.doe@example.org")).thenReturn(userDTO);
                doNothing().when(validateMethods).validateObjectId(productId);
                when(productRepository.findById(productId)).thenReturn(Optional.of(product));
                doNothing().when(mediaClient).deleteMediaByProductId(productId);
                doNothing().when(productRepository).deleteById(productId);

                // Act
                productService.deleteProduct(productId, "john.doe@example.org", "ROLE_SELLER");

                // Assert
                verify(userClient).getUserByEmail("john.doe@example.org");
                verify(validateMethods).validateObjectId(productId);
                verify(productRepository).findById(productId);
                verify(mediaClient).deleteMediaByProductId(productId);
                verify(productRepository).deleteById(productId);
        }

        /**
         * Test {@link ProductService#deleteProduct(String, String, String)}.
         *
         * <ul>
         * <li>Given unauthorized user.
         * <li>Then throw {@link IllegalArgumentException}.
         * </ul>
         */
        @Test
        @DisplayName("Test deleteProduct; given unauthorized user; then throw IllegalArgumentException")
        @Tag("ContributionFromDiffblue")
        void testDeleteProduct_givenUnauthorizedUser_thenThrowIllegalArgumentException() {
                // Arrange
                String userId = "user456";
                String productId = "product123";
                UserDTO userDTO = new UserDTO();
                userDTO.setId(userId); // Différent utilisateur
                userDTO.setName("Jane Doe");
                userDTO.setEmail("jane.doe@example.org");

                Product product = new Product();
                product.setId(productId);
                product.setName("Test Product");
                product.setUserId("user999"); // Appartient à un autre utilisateur

                when(userClient.getUserByEmail("jane.doe@example.org")).thenReturn(userDTO);
                doNothing().when(validateMethods).validateObjectId(productId);
                when(productRepository.findById(productId)).thenReturn(Optional.of(product));

                // Act and Assert
                assertThrows(IllegalArgumentException.class,
                                () -> productService.deleteProduct(productId, "jane.doe@example.org",
                                                "ROLE_CLIENT"));
                verify(userClient).getUserByEmail("jane.doe@example.org");
                verify(validateMethods).validateObjectId(productId);
                verify(productRepository).findById(productId);
        }

        /**
         * Test {@link ProductService#validateProduct(String, String)}.
         *
         * <p>
         * Method under test: {@link ProductService#validateProduct(String, String)}
         */
        @Test
        @DisplayName("Test validateProduct(String, String)")
        @Tag("ContributionFromDiffblue")
        void testValidateProduct() {
                // Arrange
                String userId = "user123";
                String productId = "product123";
                UserDTO userDTO = new UserDTO();
                userDTO.setId(userId);
                userDTO.setName("John Doe");
                userDTO.setEmail("john.doe@example.org");

                Product product = new Product();
                product.setId(productId);
                product.setName("Test Product");
                product.setUserId(userId);

                when(userClient.getUserByEmail("john.doe@example.org")).thenReturn(userDTO);
                when(productRepository.findById(productId)).thenReturn(Optional.of(product));

                // Act
                boolean result = productService.validateProduct(productId, "john.doe@example.org");

                // Assert
                verify(userClient).getUserByEmail("john.doe@example.org");
                verify(productRepository).findById(productId);
                assertTrue(result);
        }

        /**
         * Test {@link ProductService#validateProduct(String, String)}.
         *
         * <ul>
         * <li>Given null product ID.
         * <li>Then return false.
         * </ul>
         */
        @Test
        @DisplayName("Test validateProduct; given null product ID; then return false")
        @Tag("ContributionFromDiffblue")
        void testValidateProduct_givenNullProductId_thenReturnFalse() {
                // Act
                boolean result = productService.validateProduct(null, "john.doe@example.org");

                // Assert
                assertFalse(result);
        }

        /**
         * Test {@link ProductService#validateProduct(String, String)}.
         *
         * <ul>
         * <li>Given product not found.
         * <li>Then return false.
         * </ul>
         */
        @Test
        @DisplayName("Test validateProduct; given product not found; then return false")
        @Tag("ContributionFromDiffblue")
        void testValidateProduct_givenProductNotFound_thenReturnFalse() {
                // Arrange
                UserDTO userDTO = new UserDTO();
                userDTO.setId(Mockito.<String>any());
                userDTO.setName("John Doe");
                userDTO.setEmail("john.doe@example.org");

                when(userClient.getUserByEmail("john.doe@example.org")).thenReturn(userDTO);
                when(productRepository.findById("nonexistent")).thenReturn(Optional.empty());

                // Act
                boolean result = productService.validateProduct("nonexistent", "john.doe@example.org");

                // Assert
                verify(userClient).getUserByEmail("john.doe@example.org");
                verify(productRepository).findById("nonexistent");
                assertFalse(result);
        }

        /**
         * Test {@link ProductService#getProductsByUserId(String, String)}.
         *
         * <p>
         * Method under test: {@link ProductService#getProductsByUserId(String, String)}
         */
        @Test
        @DisplayName("Test getProductsByUserId(String, String)")
        @Tag("ContributionFromDiffblue")
        void testGetProductsByUserId() {
                // Arrange
                String userId = "user123";
                UserDTO userDTO = new UserDTO();
                userDTO.setId(userId);
                userDTO.setName("John Doe");
                userDTO.setEmail("john.doe@example.org");

                Product product1 = new Product();
                product1.setId("product1");
                product1.setName("Product 1");
                product1.setUserId(userId);

                Product product2 = new Product();
                product2.setId("product2");
                product2.setName("Product 2");
                product2.setUserId(userId);

                List<Product> products = new ArrayList<>();
                products.add(product1);
                products.add(product2);

                when(userClient.getUserByEmail("john.doe@example.org")).thenReturn(userDTO);
                when(productRepository.findByUserId(userId)).thenReturn(products);
                when(userClient.getSellerNameById(userId)).thenReturn("John Doe");
                when(mediaClient.getMediasByProductId(anyString())).thenReturn(new ArrayList<>());

                // Act
                List<ProductDTO> result = productService.getProductsByUserId("john.doe@example.org", "ROLE_SELLER");

                // Assert
                verify(userClient).getUserByEmail("john.doe@example.org");
                verify(productRepository).findByUserId(userId);
                assertEquals(2, result.size());
                assertEquals("product1", result.get(0).getId());
                assertEquals("product2", result.get(1).getId());
        }

        /**
         * Test {@link ProductService#getProductsByUserId(String, String)}.
         *
         * <ul>
         * <li>Given no products found for user.
         * <li>Then throw {@link ResourceNotFoundException}.
         * </ul>
         */
        @Test
        @DisplayName("Test getProductsByUserId; given no products found for user; then throw ResourceNotFoundException")
        @Tag("ContributionFromDiffblue")
        void testGetProductsByUserId_givenNoProductsFound_thenThrowResourceNotFoundException() {
                // Arrange
                UserDTO userDTO = new UserDTO();
                userDTO.setId(Mockito.<String>any());
                userDTO.setName("John Doe");
                userDTO.setEmail("john.doe@example.org");

                when(userClient.getUserByEmail("john.doe@example.org")).thenReturn(userDTO);
                when(productRepository.findByUserId(Mockito.<String>any())).thenReturn(new ArrayList<>());

                // Act and Assert
                assertThrows(ResourceNotFoundException.class,
                                () -> productService.getProductsByUserId("john.doe@example.org", "ROLE_SELLER"));
                verify(userClient).getUserByEmail("john.doe@example.org");
                verify(productRepository).findByUserId(Mockito.<String>any());
        }

        /**
         * Test {@link ProductService#deleteAllProductsByUserId(String)}.
         *
         * <p>
         * Method under test: {@link ProductService#deleteAllProductsByUserId(String)}
         */
        @Test
        @DisplayName("Test deleteAllProductsByUserId(String)")
        @Tag("ContributionFromDiffblue")
        void testDeleteAllProductsByUserId() {
                // Arrange
                String userId = "user123";
                Product product1 = new Product();
                product1.setId("product1");
                product1.setName("Product 1");
                product1.setUserId(userId);

                Product product2 = new Product();
                product2.setId("product2");
                product2.setName("Product 2");
                product2.setUserId(userId);

                List<Product> products = new ArrayList<>();
                products.add(product1);
                products.add(product2);

                doNothing().when(validateMethods).validateObjectId(userId);
                when(productRepository.findByUserId(userId)).thenReturn(products);
                doNothing().when(mediaClient).deleteMediaByProductId(anyString());
                doNothing().when(productRepository).deleteAll(products);

                // Act
                productService.deleteAllProductsByUserId(userId);

                // Assert
                verify(validateMethods).validateObjectId(userId);
                verify(productRepository).findByUserId(userId);
                verify(mediaClient).deleteMediaByProductId("product1");
                verify(mediaClient).deleteMediaByProductId("product2");
                verify(productRepository).deleteAll(products);
        }

        /**
         * Test {@link ProductService#deleteAllProductsByUserId(String)}.
         *
         * <ul>
         * <li>Given no products found for user.
         * <li>Then throw {@link ResourceNotFoundException}.
         * </ul>
         */
        @Test
        @DisplayName("Test deleteAllProductsByUserId; given no products found for user; then throw ResourceNotFoundException")
        @Tag("ContributionFromDiffblue")
        void testDeleteAllProductsByUserId_givenNoProductsFound_thenThrowResourceNotFoundException() {
                // Arrange
                doNothing().when(validateMethods).validateObjectId(Mockito.<String>any());
                when(productRepository.findByUserId(Mockito.<String>any())).thenReturn(new ArrayList<>());

                // Act and Assert
                assertThrows(ResourceNotFoundException.class,
                                () -> productService.deleteAllProductsByUserId(Mockito.<String>any()));
                verify(validateMethods).validateObjectId(Mockito.<String>any());
                verify(productRepository).findByUserId(Mockito.<String>any());
        }
}