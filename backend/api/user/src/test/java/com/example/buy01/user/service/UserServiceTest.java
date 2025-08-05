package com.example.buy01.user.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.isA;
import static org.mockito.Mockito.atLeast;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.diffblue.cover.annotations.ManagedByDiffblue;
import com.diffblue.cover.annotations.MethodsUnderTest;
import com.example.buy01.user.dto.UserCreateDTO;
import com.example.buy01.user.dto.UserDTO;
import com.example.buy01.user.dto.UserUpdateDTO;
import com.example.buy01.user.event.KafkaUserProducer;
import com.example.buy01.user.exception.EmailAlreadyUsedException;
import com.example.buy01.user.exception.ResourceNotFoundException;
import com.example.buy01.user.model.User;
import com.example.buy01.user.model.UserRoleType;
import com.example.buy01.user.model.UserRoleType.UserRole;
import com.example.buy01.user.repository.UserRepository;
import com.example.buy01.user.utils.ValidateMethods;

import java.io.ByteArrayInputStream;
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
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.PropertySource;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.aot.DisabledInAotMode;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.web.multipart.MultipartFile;

@ContextConfiguration(classes = {UserService.class, BCryptPasswordEncoder.class})
@DisabledInAotMode
@ExtendWith(SpringExtension.class)
class UserServiceTest {
    @MockitoBean
    private KafkaUserProducer kafkaUserProducer;

    @MockitoBean
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    @MockitoBean
    private ValidateMethods validateMethods;

    /**
     * Test {@link UserService#toDTO(User)}.
     *
     * <p>Method under test: {@link UserService#toDTO(User)}
     */
    @Test
    @DisplayName("Test toDTO(User)")
    @Tag("ContributionFromDiffblue")
    @ManagedByDiffblue
    @MethodsUnderTest({"UserDTO UserService.toDTO(User)"})
    void testToDTO() {
        // Arrange
        User user = new User();
        user.setAvatar("Avatar");
        user.setEmail("jane.doe@example.org");
        user.setId("42");
        user.setName("Name");
        user.setPassword("iloveyou");
        user.setRole(UserRole.CLIENT);

        // Act
        UserDTO actualToDTOResult = userService.toDTO(user);

        // Assert
        assertEquals("Avatar", actualToDTOResult.getAvatar());
        assertEquals("Name", actualToDTOResult.getName());
        assertEquals("jane.doe@example.org", actualToDTOResult.getEmail());
        assertNull(actualToDTOResult.getId());
        assertEquals(UserRole.CLIENT, actualToDTOResult.getRole());
    }

    /**
     * Test {@link UserService#createUser(UserCreateDTO, MultipartFile)}.
     *
     * <p>Method under test: {@link UserService#createUser(UserCreateDTO, MultipartFile)}
     */
    @Test
    @DisplayName("Test createUser(UserCreateDTO, MultipartFile)")
    @Tag("ContributionFromDiffblue")
    @MethodsUnderTest({
            "com.example.buy01.user.dto.UserDTO UserService.createUser(UserCreateDTO, MultipartFile)"
    })
    void testCreateUser() throws IOException {
        // Arrange
        when(userRepository.existsByEmail(Mockito.<String>any()))
                .thenThrow(new EmailAlreadyUsedException("An error occurred"));
        UserCreateDTO dto = new UserCreateDTO();
        dto.setEmail("jane.doe@example.org");
        dto.setName("Name");
        dto.setPassword("iloveyou");
        dto.setRole(UserRole.CLIENT);

        // Act and Assert
        assertThrows(
                EmailAlreadyUsedException.class,
                () ->
                        userService.createUser(
                                dto,
                                new MockMultipartFile(
                                        "Name", new ByteArrayInputStream("AXAXAXAX".getBytes("UTF-8")))));
        verify(userRepository).existsByEmail("jane.doe@example.org");
    }

    /**
     * Test {@link UserService#createUser(UserCreateDTO, MultipartFile)}.
     *
     * <ul>
     *   <li>Given {@link User} (default constructor) Avatar is {@code Avatar}.
     *   <li>Then return {@code Avatar}.
     * </ul>
     *
     * <p>Method under test: {@link UserService#createUser(UserCreateDTO, MultipartFile)}
     */
    @Test
    @DisplayName(
            "Test createUser(UserCreateDTO, MultipartFile); given User (default constructor) Avatar is 'Avatar'; then return 'Avatar'")
    @Tag("ContributionFromDiffblue")
    @ManagedByDiffblue
    @MethodsUnderTest({"UserDTO UserService.createUser(UserCreateDTO, MultipartFile)"})
    void testCreateUser_givenUserAvatarIsAvatar_thenReturnAvatar() throws IOException {
        // Arrange
        User user = new User();
        user.setAvatar("Avatar");
        user.setEmail("jane.doe@example.org");
        user.setId("42");
        user.setName("Name");
        user.setPassword("iloveyou");
        user.setRole(UserRole.CLIENT);
        when(userRepository.existsByEmail(Mockito.<String>any())).thenReturn(false);
        when(userRepository.save(Mockito.<User>any())).thenReturn(user);

        UserCreateDTO dto = new UserCreateDTO();
        dto.setEmail("jane.doe@example.org");
        dto.setName("Name");
        dto.setPassword("iloveyou");
        dto.setRole(UserRole.CLIENT);

        // Act
        UserDTO actualCreateUserResult =
                userService.createUser(
                        dto,
                        new MockMultipartFile("Name", new ByteArrayInputStream("AXAXAXAX".getBytes("UTF-8"))));

        // Assert
        verify(userRepository).existsByEmail("jane.doe@example.org");
        verify(userRepository).save(isA(User.class));
        assertEquals("Avatar", actualCreateUserResult.getAvatar());
        assertEquals("Name", actualCreateUserResult.getName());
        assertEquals("jane.doe@example.org", actualCreateUserResult.getEmail());
        assertNull(actualCreateUserResult.getId());
        assertEquals(UserRole.CLIENT, actualCreateUserResult.getRole());
    }

    /**
     * Test {@link UserService#createUser(UserCreateDTO, MultipartFile)}.
     *
     * <ul>
     *   <li>Given {@link UserRepository} {@link UserRepository#existsByEmail(String)} return {@code
     *       true}.
     * </ul>
     *
     * <p>Method under test: {@link UserService#createUser(UserCreateDTO, MultipartFile)}
     */
    @Test
    @DisplayName(
            "Test createUser(UserCreateDTO, MultipartFile); given UserRepository existsByEmail(String) return 'true'")
    @Tag("ContributionFromDiffblue")
    @ManagedByDiffblue
    @MethodsUnderTest({"UserDTO UserService.createUser(UserCreateDTO, MultipartFile)"})
    void testCreateUser_givenUserRepositoryExistsByEmailReturnTrue() throws IOException {
        // Arrange
        when(userRepository.existsByEmail(Mockito.<String>any())).thenReturn(true);

        UserCreateDTO dto = new UserCreateDTO();
        dto.setEmail("jane.doe@example.org");
        dto.setName("Name");
        dto.setPassword("iloveyou");
        dto.setRole(UserRole.CLIENT);

        // Act and Assert
        assertThrows(
                EmailAlreadyUsedException.class,
                () ->
                        userService.createUser(
                                dto,
                                new MockMultipartFile(
                                        "Name", new ByteArrayInputStream("AXAXAXAX".getBytes("UTF-8")))));
        verify(userRepository).existsByEmail("jane.doe@example.org");
    }

    /**
     * Test {@link UserService#getAllUsers()}.
     *
     * <ul>
     *   <li>Given {@link User} (default constructor) Avatar is {@code Avatar}.
     *   <li>Then return size is one.
     * </ul>
     *
     * <p>Method under test: {@link UserService#getAllUsers()}
     */
    @Test
    @DisplayName(
            "Test getAllUsers(); given User (default constructor) Avatar is 'Avatar'; then return size is one")
    @Tag("ContributionFromDiffblue")
    @ManagedByDiffblue
    @MethodsUnderTest({"List UserService.getAllUsers()"})
    void testGetAllUsers_givenUserAvatarIsAvatar_thenReturnSizeIsOne() {
        // Arrange
        User user = new User();
        user.setAvatar("Avatar");
        user.setEmail("jane.doe@example.org");
        user.setId("42");
        user.setName("Name");
        user.setPassword("iloveyou");
        user.setRole(UserRole.CLIENT);

        ArrayList<User> userList = new ArrayList<>();
        userList.add(user);
        when(userRepository.findAll()).thenReturn(userList);

        // Act
        List<UserDTO> actualAllUsers = userService.getAllUsers();

        // Assert
        verify(userRepository).findAll();
        assertEquals(1, actualAllUsers.size());
        UserDTO getResult = actualAllUsers.get(0);
        assertEquals("Avatar", getResult.getAvatar());
        assertEquals("Name", getResult.getName());
        assertEquals("jane.doe@example.org", getResult.getEmail());
        assertEquals(UserRole.CLIENT, getResult.getRole());
    }

    /**
     * Test {@link UserService#getAllUsers()}.
     *
     * <ul>
     *   <li>Given {@link UserRepository} {@link UserRepository#findAll()} return {@link
     *       ArrayList#ArrayList()}.
     *   <li>Then return Empty.
     * </ul>
     *
     * <p>Method under test: {@link UserService#getAllUsers()}
     */
    @Test
    @DisplayName(
            "Test getAllUsers(); given UserRepository findAll() return ArrayList(); then return Empty")
    @Tag("ContributionFromDiffblue")
    @ManagedByDiffblue
    @MethodsUnderTest({"List UserService.getAllUsers()"})
    void testGetAllUsers_givenUserRepositoryFindAllReturnArrayList_thenReturnEmpty() {
        // Arrange
        when(userRepository.findAll()).thenReturn(new ArrayList<>());

        // Act
        List<UserDTO> actualAllUsers = userService.getAllUsers();

        // Assert
        verify(userRepository).findAll();
        assertTrue(actualAllUsers.isEmpty());
    }

    /**
     * Test {@link UserService#getAllUsers()}.
     *
     * <ul>
     *   <li>Then return size is two.
     * </ul>
     *
     * <p>Method under test: {@link UserService#getAllUsers()}
     */
    @Test
    @DisplayName("Test getAllUsers(); then return size is two")
    @Tag("ContributionFromDiffblue")
    @ManagedByDiffblue
    @MethodsUnderTest({"List UserService.getAllUsers()"})
    void testGetAllUsers_thenReturnSizeIsTwo() {
        // Arrange
        User user = new User();
        user.setAvatar("Avatar");
        user.setEmail("jane.doe@example.org");
        user.setId("42");
        user.setName("Name");
        user.setPassword("iloveyou");
        user.setRole(UserRole.CLIENT);

        User user2 = new User();
        user2.setAvatar("com.example.buy01.user.model.User");
        user2.setEmail("john.smith@example.org");
        user2.setId("Id");
        user2.setName("com.example.buy01.user.model.User");
        user2.setPassword("Password");
        user2.setRole(UserRole.SELLER);

        ArrayList<User> userList = new ArrayList<>();
        userList.add(user2);
        userList.add(user);
        when(userRepository.findAll()).thenReturn(userList);

        // Act
        List<UserDTO> actualAllUsers = userService.getAllUsers();

        // Assert
        verify(userRepository).findAll();
        assertEquals(2, actualAllUsers.size());
        UserDTO getResult = actualAllUsers.get(1);
        assertEquals("Avatar", getResult.getAvatar());
        assertEquals("Name", getResult.getName());
        UserDTO getResult2 = actualAllUsers.get(0);
        assertEquals("com.example.buy01.user.model.User", getResult2.getAvatar());
        assertEquals("com.example.buy01.user.model.User", getResult2.getName());
        assertEquals("jane.doe@example.org", getResult.getEmail());
        assertEquals("john.smith@example.org", getResult2.getEmail());
        assertNull(getResult.getId());
        assertEquals(UserRole.CLIENT, getResult.getRole());
        assertEquals(UserRole.SELLER, getResult2.getRole());
    }

    /**
     * Test {@link UserService#getAllUsers()}.
     *
     * <ul>
     *   <li>Then throw {@link EmailAlreadyUsedException}.
     * </ul>
     *
     * <p>Method under test: {@link UserService#getAllUsers()}
     */
    @Test
    @DisplayName("Test getAllUsers(); then throw EmailAlreadyUsedException")
    @Tag("ContributionFromDiffblue")
    @ManagedByDiffblue
    @MethodsUnderTest({"List UserService.getAllUsers()"})
    void testGetAllUsers_thenThrowEmailAlreadyUsedException() {
        // Arrange
        when(userRepository.findAll()).thenThrow(new EmailAlreadyUsedException("An error occurred"));

        // Act and Assert
        assertThrows(EmailAlreadyUsedException.class, () -> userService.getAllUsers());
        verify(userRepository).findAll();
    }

    /**
     * Test {@link UserService#getUserById(String)}.
     *
     * <p>Method under test: {@link UserService#getUserById(String)}
     */
    @Test
    @DisplayName("Test getUserById(String)")
    @Tag("ContributionFromDiffblue")
    @ManagedByDiffblue
    @MethodsUnderTest({"UserDTO UserService.getUserById(String)"})
    void testGetUserById() {
        // Arrange
        when(userRepository.findById(Mockito.<String>any()))
                .thenThrow(new EmailAlreadyUsedException("An error occurred"));
        doNothing().when(validateMethods).validateObjectId(Mockito.<String>any());

        // Act and Assert
        assertThrows(EmailAlreadyUsedException.class, () -> userService.getUserById("42"));
        verify(validateMethods).validateObjectId("42");
        verify(userRepository).findById("42");
    }

    /**
     * Test {@link UserService#getUserById(String)}.
     *
     * <ul>
     *   <li>Given {@link User} (default constructor) Avatar is {@code Avatar}.
     *   <li>Then return {@code Avatar}.
     * </ul>
     *
     * <p>Method under test: {@link UserService#getUserById(String)}
     */
    @Test
    @DisplayName(
            "Test getUserById(String); given User (default constructor) Avatar is 'Avatar'; then return 'Avatar'")
    @Tag("ContributionFromDiffblue")
    @ManagedByDiffblue
    @MethodsUnderTest({"UserDTO UserService.getUserById(String)"})
    void testGetUserById_givenUserAvatarIsAvatar_thenReturnAvatar() {
        // Arrange
        User user = new User();
        user.setAvatar("Avatar");
        user.setEmail("jane.doe@example.org");
        user.setId("42");
        user.setName("Name");
        user.setPassword("iloveyou");
        user.setRole(UserRole.CLIENT);
        Optional<User> ofResult = Optional.of(user);
        when(userRepository.findById(Mockito.<String>any())).thenReturn(ofResult);
        doNothing().when(validateMethods).validateObjectId(Mockito.<String>any());

        // Act
        UserDTO actualUserById = userService.getUserById("42");

        // Assert
        verify(validateMethods).validateObjectId("42");
        verify(userRepository).findById("42");
        assertEquals("Avatar", actualUserById.getAvatar());
        assertEquals("Name", actualUserById.getName());
        assertEquals("jane.doe@example.org", actualUserById.getEmail());
        assertNull(actualUserById.getId());
        assertEquals(UserRole.CLIENT, actualUserById.getRole());
    }

    /**
     * Test {@link UserService#getUserById(String)}.
     *
     * <ul>
     *   <li>Given {@link UserRepository}.
     *   <li>Then throw {@link EmailAlreadyUsedException}.
     * </ul>
     *
     * <p>Method under test: {@link UserService#getUserById(String)}
     */
    @Test
    @DisplayName(
            "Test getUserById(String); given UserRepository; then throw EmailAlreadyUsedException")
    @Tag("ContributionFromDiffblue")
    @ManagedByDiffblue
    @MethodsUnderTest({"UserDTO UserService.getUserById(String)"})
    void testGetUserById_givenUserRepository_thenThrowEmailAlreadyUsedException() {
        // Arrange
        doThrow(new EmailAlreadyUsedException("An error occurred"))
                .when(validateMethods)
                .validateObjectId(Mockito.<String>any());

        // Act and Assert
        assertThrows(EmailAlreadyUsedException.class, () -> userService.getUserById("42"));
        verify(validateMethods).validateObjectId("42");
    }

    /**
     * Test {@link UserService#getUserById(String)}.
     *
     * <ul>
     *   <li>Then throw {@link UsernameNotFoundException}.
     * </ul>
     *
     * <p>Method under test: {@link UserService#getUserById(String)}
     */
    @Test
    @DisplayName("Test getUserById(String); then throw UsernameNotFoundException")
    @Tag("ContributionFromDiffblue")
    @ManagedByDiffblue
    @MethodsUnderTest({"UserDTO UserService.getUserById(String)"})
    void testGetUserById_thenThrowUsernameNotFoundException() {
        // Arrange
        Optional<User> emptyResult = Optional.empty();
        when(userRepository.findById(Mockito.<String>any())).thenReturn(emptyResult);
        doNothing().when(validateMethods).validateObjectId(Mockito.<String>any());

        // Act and Assert
        assertThrows(UsernameNotFoundException.class, () -> userService.getUserById("42"));
        verify(validateMethods).validateObjectId("42");
        verify(userRepository).findById("42");
    }

    /**
     * Test {@link UserService#getUserByEmail(String)}.
     *
     * <ul>
     *   <li>Given {@link User} (default constructor) Avatar is {@code Avatar}.
     *   <li>Then return {@link User} (default constructor).
     * </ul>
     *
     * <p>Method under test: {@link UserService#getUserByEmail(String)}
     */
    @Test
    @DisplayName(
            "Test getUserByEmail(String); given User (default constructor) Avatar is 'Avatar'; then return User (default constructor)")
    @Tag("ContributionFromDiffblue")
    @ManagedByDiffblue
    @MethodsUnderTest({"User UserService.getUserByEmail(String)"})
    void testGetUserByEmail_givenUserAvatarIsAvatar_thenReturnUser() {
        // Arrange
        User user = new User();
        user.setAvatar("Avatar");
        user.setEmail("jane.doe@example.org");
        user.setId("42");
        user.setName("Name");
        user.setPassword("iloveyou");
        user.setRole(UserRole.CLIENT);
        when(userRepository.findByEmail(Mockito.<String>any())).thenReturn(user);

        // Act
        User actualUserByEmail = userService.getUserByEmail("jane.doe@example.org");

        // Assert
        verify(userRepository).findByEmail("jane.doe@example.org");
        assertSame(user, actualUserByEmail);
    }

    /**
     * Test {@link UserService#getUserByEmail(String)}.
     *
     * <ul>
     *   <li>Then throw {@link EmailAlreadyUsedException}.
     * </ul>
     *
     * <p>Method under test: {@link UserService#getUserByEmail(String)}
     */
    @Test
    @DisplayName("Test getUserByEmail(String); then throw EmailAlreadyUsedException")
    @Tag("ContributionFromDiffblue")
    @ManagedByDiffblue
    @MethodsUnderTest({"User UserService.getUserByEmail(String)"})
    void testGetUserByEmail_thenThrowEmailAlreadyUsedException() {
        // Arrange
        when(userRepository.findByEmail(Mockito.<String>any()))
                .thenThrow(new EmailAlreadyUsedException("An error occurred"));

        // Act and Assert
        assertThrows(
                EmailAlreadyUsedException.class, () -> userService.getUserByEmail("jane.doe@example.org"));
        verify(userRepository).findByEmail("jane.doe@example.org");
    }

    /**
     * Test {@link UserService#updateUser(String, UserUpdateDTO)}.
     *
     * <p>Method under test: {@link UserService#updateUser(String, UserUpdateDTO)}
     */
    @Test
    @DisplayName("Test updateUser(String, UserUpdateDTO)")
    @Tag("ContributionFromDiffblue")
    @ManagedByDiffblue
    @MethodsUnderTest({"UserDTO UserService.updateUser(String, UserUpdateDTO)"})
    void testUpdateUser() {
        // Arrange
        User user = new User();
        user.setAvatar("Avatar");
        user.setEmail("jane.doe@example.org");
        user.setId("42");
        user.setName("Name");
        user.setPassword("iloveyou");
        user.setRole(UserRole.CLIENT);
        Optional<User> ofResult = Optional.of(user);
        when(userRepository.save(Mockito.<User>any()))
                .thenThrow(new EmailAlreadyUsedException("An error occurred"));
        when(userRepository.findById(Mockito.<String>any())).thenReturn(ofResult);
        doNothing().when(validateMethods).validateObjectId(Mockito.<String>any());

        UserUpdateDTO dto = new UserUpdateDTO();
        dto.setEmail("jane.doe@example.org");
        dto.setName("Name");
        dto.setPassword("iloveyou");

        // Act and Assert
        assertThrows(EmailAlreadyUsedException.class, () -> userService.updateUser("42", dto));
        verify(validateMethods).validateObjectId("42");
        verify(userRepository).findById("42");
        verify(userRepository).save(isA(User.class));
    }

    /**
     * Test {@link UserService#updateUser(String, UserUpdateDTO)}.
     *
     * <p>Method under test: {@link UserService#updateUser(String, UserUpdateDTO)}
     */
    @Test
    @DisplayName("Test updateUser(String, UserUpdateDTO)")
    @Tag("ContributionFromDiffblue")
    @ManagedByDiffblue
    @MethodsUnderTest({"UserDTO UserService.updateUser(String, UserUpdateDTO)"})
    void testUpdateUser2() {
        // Arrange
        User user = mock(User.class);
        when(user.getRole()).thenThrow(new EmailAlreadyUsedException("An error occurred"));
        when(user.getName()).thenReturn("Name");
        doNothing().when(user).setAvatar(Mockito.<String>any());
        doNothing().when(user).setEmail(Mockito.<String>any());
        doNothing().when(user).setId(Mockito.<String>any());
        doNothing().when(user).setName(Mockito.<String>any());
        doNothing().when(user).setPassword(Mockito.<String>any());
        doNothing().when(user).setRole(Mockito.<UserRole>any());
        user.setAvatar("Avatar");
        user.setEmail("jane.doe@example.org");
        user.setId("42");
        user.setName("Name");
        user.setPassword("iloveyou");
        user.setRole(UserRole.CLIENT);
        Optional<User> ofResult = Optional.of(user);
        when(userRepository.findById(Mockito.<String>any())).thenReturn(ofResult);
        doNothing().when(validateMethods).validateObjectId(Mockito.<String>any());

        UserUpdateDTO dto = new UserUpdateDTO();
        dto.setEmail("jane.doe@example.org");
        dto.setName("Name");
        dto.setPassword("iloveyou");

        // Act and Assert
        assertThrows(EmailAlreadyUsedException.class, () -> userService.updateUser("42", dto));
        verify(user).getName();
        verify(user).getRole();
        verify(user).setAvatar("Avatar");
        verify(user).setEmail("jane.doe@example.org");
        verify(user).setId("42");
        verify(user, atLeast(1)).setName("Name");
        verify(user, atLeast(1)).setPassword(Mockito.<String>any());
        verify(user).setRole(UserRole.CLIENT);
        verify(validateMethods).validateObjectId("42");
        verify(userRepository).findById("42");
    }

    /**
     * Test {@link UserService#updateUser(String, UserUpdateDTO)}.
     *
     * <ul>
     *   <li>Given {@code null}.
     *   <li>When {@link UserUpdateDTO} {@link UserUpdateDTO#getName()} return {@code null}.
     *   <li>Then return {@code Avatar}.
     * </ul>
     *
     * <p>Method under test: {@link UserService#updateUser(String, UserUpdateDTO)}
     */
    @Test
    @DisplayName(
            "Test updateUser(String, UserUpdateDTO); given 'null'; when UserUpdateDTO getName() return 'null'; then return 'Avatar'")
    @Tag("ContributionFromDiffblue")
    @ManagedByDiffblue
    @MethodsUnderTest({"UserDTO UserService.updateUser(String, UserUpdateDTO)"})
    void testUpdateUser_givenNull_whenUserUpdateDTOGetNameReturnNull_thenReturnAvatar() {
        // Arrange
        User user = mock(User.class);
        when(user.getRole()).thenReturn(UserRole.CLIENT);
        when(user.getName()).thenReturn("Name");
        doNothing().when(user).setAvatar(Mockito.<String>any());
        doNothing().when(user).setEmail(Mockito.<String>any());
        doNothing().when(user).setId(Mockito.<String>any());
        doNothing().when(user).setName(Mockito.<String>any());
        doNothing().when(user).setPassword(Mockito.<String>any());
        doNothing().when(user).setRole(Mockito.<UserRole>any());
        user.setAvatar("Avatar");
        user.setEmail("jane.doe@example.org");
        user.setId("42");
        user.setName("Name");
        user.setPassword("iloveyou");
        user.setRole(UserRole.CLIENT);
        Optional<User> ofResult = Optional.of(user);

        User user2 = new User();
        user2.setAvatar("Avatar");
        user2.setEmail("jane.doe@example.org");
        user2.setId("42");
        user2.setName("Name");
        user2.setPassword("iloveyou");
        user2.setRole(UserRole.CLIENT);
        when(userRepository.save(Mockito.<User>any())).thenReturn(user2);
        when(userRepository.findById(Mockito.<String>any())).thenReturn(ofResult);
        doNothing().when(validateMethods).validateObjectId(Mockito.<String>any());
        UserUpdateDTO dto = mock(UserUpdateDTO.class);
        when(dto.getName()).thenReturn(null);
        when(dto.getPassword()).thenReturn(null);
        doNothing().when(dto).setEmail(Mockito.<String>any());
        doNothing().when(dto).setName(Mockito.<String>any());
        doNothing().when(dto).setPassword(Mockito.<String>any());
        dto.setEmail("jane.doe@example.org");
        dto.setName("Name");
        dto.setPassword("iloveyou");

        // Act
        UserDTO actualUpdateUserResult = userService.updateUser("42", dto);

        // Assert
        verify(dto).getName();
        verify(dto).getPassword();
        verify(dto).setEmail("jane.doe@example.org");
        verify(dto).setName("Name");
        verify(dto).setPassword("iloveyou");
        verify(user).getName();
        verify(user, atLeast(1)).getRole();
        verify(user).setAvatar("Avatar");
        verify(user).setEmail("jane.doe@example.org");
        verify(user).setId("42");
        verify(user).setName("Name");
        verify(user).setPassword("iloveyou");
        verify(user).setRole(UserRole.CLIENT);
        verify(validateMethods).validateObjectId("42");
        verify(userRepository).findById("42");
        verify(userRepository).save(isA(User.class));
        assertEquals("Avatar", actualUpdateUserResult.getAvatar());
        assertEquals("Name", actualUpdateUserResult.getName());
        assertEquals("jane.doe@example.org", actualUpdateUserResult.getEmail());
        assertNull(actualUpdateUserResult.getId());
        assertEquals(UserRole.CLIENT, actualUpdateUserResult.getRole());
    }

    /**
     * Test {@link UserService#updateUser(String, UserUpdateDTO)}.
     *
     * <ul>
     *   <li>Given {@link User} {@link User#getName()} return {@code User}.
     * </ul>
     *
     * <p>Method under test: {@link UserService#updateUser(String, UserUpdateDTO)}
     */
    @Test
    @DisplayName(
            "Test updateUser(String, UserUpdateDTO); given User getName() return 'com.example.buy01.user.model.User'")
    @Tag("ContributionFromDiffblue")
    @ManagedByDiffblue
    @MethodsUnderTest({"UserDTO UserService.updateUser(String, UserUpdateDTO)"})
    void testUpdateUser_givenUserGetNameReturnComExampleBuy01UserModelUser() {
        // Arrange
        User user = mock(User.class);
        when(user.getName()).thenReturn("com.example.buy01.user.model.User");
        doNothing().when(user).setAvatar(Mockito.<String>any());
        doNothing().when(user).setEmail(Mockito.<String>any());
        doNothing().when(user).setId(Mockito.<String>any());
        doNothing().when(user).setName(Mockito.<String>any());
        doNothing().when(user).setPassword(Mockito.<String>any());
        doNothing().when(user).setRole(Mockito.<UserRole>any());
        user.setAvatar("Avatar");
        user.setEmail("jane.doe@example.org");
        user.setId("42");
        user.setName("Name");
        user.setPassword("iloveyou");
        user.setRole(UserRole.CLIENT);
        Optional<User> ofResult = Optional.of(user);
        when(userRepository.findById(Mockito.<String>any())).thenReturn(ofResult);
        doNothing().when(validateMethods).validateObjectId(Mockito.<String>any());

        UserUpdateDTO dto = new UserUpdateDTO();
        dto.setEmail("jane.doe@example.org");
        dto.setName("Name");
        dto.setPassword("iloveyou");

        // Act and Assert
        assertThrows(IllegalArgumentException.class, () -> userService.updateUser("42", dto));
        verify(user).getName();
        verify(user).setAvatar("Avatar");
        verify(user).setEmail("jane.doe@example.org");
        verify(user).setId("42");
        verify(user, atLeast(1)).setName("Name");
        verify(user, atLeast(1)).setPassword(Mockito.<String>any());
        verify(user).setRole(UserRole.CLIENT);
        verify(validateMethods).validateObjectId("42");
        verify(userRepository).findById("42");
    }

    /**
     * Test {@link UserService#updateUser(String, UserUpdateDTO)}.
     *
     * <ul>
     *   <li>Given {@link User} {@link User#getName()} return empty string.
     * </ul>
     *
     * <p>Method under test: {@link UserService#updateUser(String, UserUpdateDTO)}
     */
    @Test
    @DisplayName("Test updateUser(String, UserUpdateDTO); given User getName() return empty string")
    @Tag("ContributionFromDiffblue")
    @ManagedByDiffblue
    @MethodsUnderTest({"UserDTO UserService.updateUser(String, UserUpdateDTO)"})
    void testUpdateUser_givenUserGetNameReturnEmptyString() {
        // Arrange
        User user = mock(User.class);
        when(user.getName()).thenReturn("");
        doNothing().when(user).setAvatar(Mockito.<String>any());
        doNothing().when(user).setEmail(Mockito.<String>any());
        doNothing().when(user).setId(Mockito.<String>any());
        doNothing().when(user).setName(Mockito.<String>any());
        doNothing().when(user).setPassword(Mockito.<String>any());
        doNothing().when(user).setRole(Mockito.<UserRole>any());
        user.setAvatar("Avatar");
        user.setEmail("jane.doe@example.org");
        user.setId("42");
        user.setName("Name");
        user.setPassword("iloveyou");
        user.setRole(UserRole.CLIENT);
        Optional<User> ofResult = Optional.of(user);
        when(userRepository.findById(Mockito.<String>any())).thenReturn(ofResult);
        doNothing().when(validateMethods).validateObjectId(Mockito.<String>any());

        UserUpdateDTO dto = new UserUpdateDTO();
        dto.setEmail("jane.doe@example.org");
        dto.setName("Name");
        dto.setPassword("iloveyou");

        // Act and Assert
        assertThrows(IllegalArgumentException.class, () -> userService.updateUser("42", dto));
        verify(user).getName();
        verify(user).setAvatar("Avatar");
        verify(user).setEmail("jane.doe@example.org");
        verify(user).setId("42");
        verify(user, atLeast(1)).setName("Name");
        verify(user, atLeast(1)).setPassword(Mockito.<String>any());
        verify(user).setRole(UserRole.CLIENT);
        verify(validateMethods).validateObjectId("42");
        verify(userRepository).findById("42");
    }

    /**
     * Test {@link UserService#updateUser(String, UserUpdateDTO)}.
     *
     * <ul>
     *   <li>Given {@link User} {@link User#getName()} return {@code null}.
     *   <li>Then calls {@link UserUpdateDTO#getName()}.
     * </ul>
     *
     * <p>Method under test: {@link UserService#updateUser(String, UserUpdateDTO)}
     */
    @Test
    @DisplayName(
            "Test updateUser(String, UserUpdateDTO); given User getName() return 'null'; then calls getName()")
    @Tag("ContributionFromDiffblue")
    @ManagedByDiffblue
    @MethodsUnderTest({"UserDTO UserService.updateUser(String, UserUpdateDTO)"})
    void testUpdateUser_givenUserGetNameReturnNull_thenCallsGetName() {
        // Arrange
        User user = mock(User.class);
        when(user.getName()).thenReturn(null);
        doNothing().when(user).setAvatar(Mockito.<String>any());
        doNothing().when(user).setEmail(Mockito.<String>any());
        doNothing().when(user).setId(Mockito.<String>any());
        doNothing().when(user).setName(Mockito.<String>any());
        doNothing().when(user).setPassword(Mockito.<String>any());
        doNothing().when(user).setRole(Mockito.<UserRole>any());
        user.setAvatar("Avatar");
        user.setEmail("jane.doe@example.org");
        user.setId("42");
        user.setName("Name");
        user.setPassword("iloveyou");
        user.setRole(UserRole.CLIENT);
        Optional<User> ofResult = Optional.of(user);
        when(userRepository.findById(Mockito.<String>any())).thenReturn(ofResult);
        doNothing().when(validateMethods).validateObjectId(Mockito.<String>any());
        UserUpdateDTO dto = mock(UserUpdateDTO.class);
        when(dto.getName()).thenReturn(" ");
        when(dto.getPassword()).thenReturn(" ");
        doNothing().when(dto).setEmail(Mockito.<String>any());
        doNothing().when(dto).setName(Mockito.<String>any());
        doNothing().when(dto).setPassword(Mockito.<String>any());
        dto.setEmail("jane.doe@example.org");
        dto.setName("Name");
        dto.setPassword("iloveyou");

        // Act and Assert
        assertThrows(IllegalArgumentException.class, () -> userService.updateUser("42", dto));
        verify(dto, atLeast(1)).getName();
        verify(dto, atLeast(1)).getPassword();
        verify(dto).setEmail("jane.doe@example.org");
        verify(dto).setName("Name");
        verify(dto).setPassword("iloveyou");
        verify(user).getName();
        verify(user).setAvatar("Avatar");
        verify(user).setEmail("jane.doe@example.org");
        verify(user).setId("42");
        verify(user).setName("Name");
        verify(user).setPassword("iloveyou");
        verify(user).setRole(UserRole.CLIENT);
        verify(validateMethods).validateObjectId("42");
        verify(userRepository).findById("42");
    }

    /**
     * Test {@link UserService#updateUser(String, UserUpdateDTO)}.
     *
     * <ul>
     *   <li>Given {@link User} {@link User#getName()} return {@code <script>UU</script>}.
     *   <li>Then calls {@link UserUpdateDTO#getName()}.
     * </ul>
     *
     * <p>Method under test: {@link UserService#updateUser(String, UserUpdateDTO)}
     */
    @Test
    @DisplayName(
            "Test updateUser(String, UserUpdateDTO); given User getName() return '<script>UU</script>'; then calls getName()")
    @Tag("ContributionFromDiffblue")
    @ManagedByDiffblue
    @MethodsUnderTest({"UserDTO UserService.updateUser(String, UserUpdateDTO)"})
    void testUpdateUser_givenUserGetNameReturnScriptUuScript_thenCallsGetName() {
        // Arrange
        User user = mock(User.class);
        when(user.getName()).thenReturn("<script>UU</script>");
        doNothing().when(user).setAvatar(Mockito.<String>any());
        doNothing().when(user).setEmail(Mockito.<String>any());
        doNothing().when(user).setId(Mockito.<String>any());
        doNothing().when(user).setName(Mockito.<String>any());
        doNothing().when(user).setPassword(Mockito.<String>any());
        doNothing().when(user).setRole(Mockito.<UserRole>any());
        user.setAvatar("Avatar");
        user.setEmail("jane.doe@example.org");
        user.setId("42");
        user.setName("Name");
        user.setPassword("iloveyou");
        user.setRole(UserRole.CLIENT);
        Optional<User> ofResult = Optional.of(user);
        when(userRepository.findById(Mockito.<String>any())).thenReturn(ofResult);
        doNothing().when(validateMethods).validateObjectId(Mockito.<String>any());
        UserUpdateDTO dto = mock(UserUpdateDTO.class);
        when(dto.getName()).thenReturn(" ");
        when(dto.getPassword()).thenReturn(" ");
        doNothing().when(dto).setEmail(Mockito.<String>any());
        doNothing().when(dto).setName(Mockito.<String>any());
        doNothing().when(dto).setPassword(Mockito.<String>any());
        dto.setEmail("jane.doe@example.org");
        dto.setName("Name");
        dto.setPassword("iloveyou");

        // Act and Assert
        assertThrows(IllegalArgumentException.class, () -> userService.updateUser("42", dto));
        verify(dto, atLeast(1)).getName();
        verify(dto, atLeast(1)).getPassword();
        verify(dto).setEmail("jane.doe@example.org");
        verify(dto).setName("Name");
        verify(dto).setPassword("iloveyou");
        verify(user).getName();
        verify(user).setAvatar("Avatar");
        verify(user).setEmail("jane.doe@example.org");
        verify(user).setId("42");
        verify(user).setName("Name");
        verify(user).setPassword("iloveyou");
        verify(user).setRole(UserRole.CLIENT);
        verify(validateMethods).validateObjectId("42");
        verify(userRepository).findById("42");
    }

    /**
     * Test {@link UserService#updateUser(String, UserUpdateDTO)}.
     *
     * <ul>
     *   <li>Given {@link User} {@link User#getRole()} return {@code ADMIN}.
     *   <li>Then throw {@link IllegalArgumentException}.
     * </ul>
     *
     * <p>Method under test: {@link UserService#updateUser(String, UserUpdateDTO)}
     */
    @Test
    @DisplayName(
            "Test updateUser(String, UserUpdateDTO); given User getRole() return 'ADMIN'; then throw IllegalArgumentException")
    @Tag("ContributionFromDiffblue")
    @ManagedByDiffblue
    @MethodsUnderTest({"UserDTO UserService.updateUser(String, UserUpdateDTO)"})
    void testUpdateUser_givenUserGetRoleReturnAdmin_thenThrowIllegalArgumentException() {
        // Arrange
        User user = mock(User.class);
        when(user.getRole()).thenReturn(UserRole.ADMIN);
        when(user.getName()).thenReturn("Name");
        doNothing().when(user).setAvatar(Mockito.<String>any());
        doNothing().when(user).setEmail(Mockito.<String>any());
        doNothing().when(user).setId(Mockito.<String>any());
        doNothing().when(user).setName(Mockito.<String>any());
        doNothing().when(user).setPassword(Mockito.<String>any());
        doNothing().when(user).setRole(Mockito.<UserRole>any());
        user.setAvatar("Avatar");
        user.setEmail("jane.doe@example.org");
        user.setId("42");
        user.setName("Name");
        user.setPassword("iloveyou");
        user.setRole(UserRole.CLIENT);
        Optional<User> ofResult = Optional.of(user);
        when(userRepository.findById(Mockito.<String>any())).thenReturn(ofResult);
        doNothing().when(validateMethods).validateObjectId(Mockito.<String>any());

        UserUpdateDTO dto = new UserUpdateDTO();
        dto.setEmail("jane.doe@example.org");
        dto.setName("Name");
        dto.setPassword("iloveyou");

        // Act and Assert
        assertThrows(IllegalArgumentException.class, () -> userService.updateUser("42", dto));
        verify(user).getName();
        verify(user, atLeast(1)).getRole();
        verify(user).setAvatar("Avatar");
        verify(user).setEmail("jane.doe@example.org");
        verify(user).setId("42");
        verify(user, atLeast(1)).setName("Name");
        verify(user, atLeast(1)).setPassword(Mockito.<String>any());
        verify(user).setRole(UserRole.CLIENT);
        verify(validateMethods).validateObjectId("42");
        verify(userRepository).findById("42");
    }

    /**
     * Test {@link UserService#updateUser(String, UserUpdateDTO)}.
     *
     * <ul>
     *   <li>Given {@link User} {@link User#getRole()} return {@code CLIENT}.
     *   <li>Then return {@code Avatar}.
     * </ul>
     *
     * <p>Method under test: {@link UserService#updateUser(String, UserUpdateDTO)}
     */
    @Test
    @DisplayName(
            "Test updateUser(String, UserUpdateDTO); given User getRole() return 'CLIENT'; then return 'Avatar'")
    @Tag("ContributionFromDiffblue")
    @ManagedByDiffblue
    @MethodsUnderTest({"UserDTO UserService.updateUser(String, UserUpdateDTO)"})
    void testUpdateUser_givenUserGetRoleReturnClient_thenReturnAvatar() {
        // Arrange
        User user = mock(User.class);
        when(user.getRole()).thenReturn(UserRole.CLIENT);
        when(user.getName()).thenReturn("Name");
        doNothing().when(user).setAvatar(Mockito.<String>any());
        doNothing().when(user).setEmail(Mockito.<String>any());
        doNothing().when(user).setId(Mockito.<String>any());
        doNothing().when(user).setName(Mockito.<String>any());
        doNothing().when(user).setPassword(Mockito.<String>any());
        doNothing().when(user).setRole(Mockito.<UserRole>any());
        user.setAvatar("Avatar");
        user.setEmail("jane.doe@example.org");
        user.setId("42");
        user.setName("Name");
        user.setPassword("iloveyou");
        user.setRole(UserRole.CLIENT);
        Optional<User> ofResult = Optional.of(user);

        User user2 = new User();
        user2.setAvatar("Avatar");
        user2.setEmail("jane.doe@example.org");
        user2.setId("42");
        user2.setName("Name");
        user2.setPassword("iloveyou");
        user2.setRole(UserRole.CLIENT);
        when(userRepository.save(Mockito.<User>any())).thenReturn(user2);
        when(userRepository.findById(Mockito.<String>any())).thenReturn(ofResult);
        doNothing().when(validateMethods).validateObjectId(Mockito.<String>any());
        UserUpdateDTO dto = mock(UserUpdateDTO.class);
        when(dto.getName()).thenReturn(" ");
        when(dto.getPassword()).thenReturn(" ");
        doNothing().when(dto).setEmail(Mockito.<String>any());
        doNothing().when(dto).setName(Mockito.<String>any());
        doNothing().when(dto).setPassword(Mockito.<String>any());
        dto.setEmail("jane.doe@example.org");
        dto.setName("Name");
        dto.setPassword("iloveyou");

        // Act
        UserDTO actualUpdateUserResult = userService.updateUser("42", dto);

        // Assert
        verify(dto, atLeast(1)).getName();
        verify(dto, atLeast(1)).getPassword();
        verify(dto).setEmail("jane.doe@example.org");
        verify(dto).setName("Name");
        verify(dto).setPassword("iloveyou");
        verify(user).getName();
        verify(user, atLeast(1)).getRole();
        verify(user).setAvatar("Avatar");
        verify(user).setEmail("jane.doe@example.org");
        verify(user).setId("42");
        verify(user).setName("Name");
        verify(user).setPassword("iloveyou");
        verify(user).setRole(UserRole.CLIENT);
        verify(validateMethods).validateObjectId("42");
        verify(userRepository).findById("42");
        verify(userRepository).save(isA(User.class));
        assertEquals("Avatar", actualUpdateUserResult.getAvatar());
        assertEquals("Name", actualUpdateUserResult.getName());
        assertEquals("jane.doe@example.org", actualUpdateUserResult.getEmail());
        assertNull(actualUpdateUserResult.getId());
        assertEquals(UserRole.CLIENT, actualUpdateUserResult.getRole());
    }

    /**
     * Test {@link UserService#updateUser(String, UserUpdateDTO)}.
     *
     * <ul>
     *   <li>Given {@link User} {@link User#getRole()} return {@code SELLER}.
     *   <li>Then return {@code Avatar}.
     * </ul>
     *
     * <p>Method under test: {@link UserService#updateUser(String, UserUpdateDTO)}
     */
    @Test
    @DisplayName(
            "Test updateUser(String, UserUpdateDTO); given User getRole() return 'SELLER'; then return 'Avatar'")
    @Tag("ContributionFromDiffblue")
    @ManagedByDiffblue
    @MethodsUnderTest({"UserDTO UserService.updateUser(String, UserUpdateDTO)"})
    void testUpdateUser_givenUserGetRoleReturnSeller_thenReturnAvatar() {
        // Arrange
        User user = mock(User.class);
        when(user.getRole()).thenReturn(UserRole.SELLER);
        when(user.getName()).thenReturn("Name");
        doNothing().when(user).setAvatar(Mockito.<String>any());
        doNothing().when(user).setEmail(Mockito.<String>any());
        doNothing().when(user).setId(Mockito.<String>any());
        doNothing().when(user).setName(Mockito.<String>any());
        doNothing().when(user).setPassword(Mockito.<String>any());
        doNothing().when(user).setRole(Mockito.<UserRole>any());
        user.setAvatar("Avatar");
        user.setEmail("jane.doe@example.org");
        user.setId("42");
        user.setName("Name");
        user.setPassword("iloveyou");
        user.setRole(UserRole.CLIENT);
        Optional<User> ofResult = Optional.of(user);

        User user2 = new User();
        user2.setAvatar("Avatar");
        user2.setEmail("jane.doe@example.org");
        user2.setId("42");
        user2.setName("Name");
        user2.setPassword("iloveyou");
        user2.setRole(UserRole.CLIENT);
        when(userRepository.save(Mockito.<User>any())).thenReturn(user2);
        when(userRepository.findById(Mockito.<String>any())).thenReturn(ofResult);
        doNothing().when(validateMethods).validateObjectId(Mockito.<String>any());

        UserUpdateDTO dto = new UserUpdateDTO();
        dto.setEmail("jane.doe@example.org");
        dto.setName("Name");
        dto.setPassword("iloveyou");

        // Act
        UserDTO actualUpdateUserResult = userService.updateUser("42", dto);

        // Assert
        verify(user).getName();
        verify(user, atLeast(1)).getRole();
        verify(user).setAvatar("Avatar");
        verify(user).setEmail("jane.doe@example.org");
        verify(user).setId("42");
        verify(user, atLeast(1)).setName("Name");
        verify(user, atLeast(1)).setPassword(Mockito.<String>any());
        verify(user).setRole(UserRole.CLIENT);
        verify(validateMethods).validateObjectId("42");
        verify(userRepository).findById("42");
        verify(userRepository).save(isA(User.class));
        assertEquals("Avatar", actualUpdateUserResult.getAvatar());
        assertEquals("Name", actualUpdateUserResult.getName());
        assertEquals("jane.doe@example.org", actualUpdateUserResult.getEmail());
        assertNull(actualUpdateUserResult.getId());
        assertEquals(UserRole.CLIENT, actualUpdateUserResult.getRole());
    }

    /**
     * Test {@link UserService#updateUser(String, UserUpdateDTO)}.
     *
     * <ul>
     *   <li>Given {@link UserRepository} {@link UserRepository#findById(Object)} return of {@link
     *       User} (default constructor).
     *   <li>Then return {@code Avatar}.
     * </ul>
     *
     * <p>Method under test: {@link UserService#updateUser(String, UserUpdateDTO)}
     */
    @Test
    @DisplayName(
            "Test updateUser(String, UserUpdateDTO); given UserRepository findById(Object) return of User (default constructor); then return 'Avatar'")
    @Tag("ContributionFromDiffblue")
    @ManagedByDiffblue
    @MethodsUnderTest({"UserDTO UserService.updateUser(String, UserUpdateDTO)"})
    void testUpdateUser_givenUserRepositoryFindByIdReturnOfUser_thenReturnAvatar() {
        // Arrange
        User user = new User();
        user.setAvatar("Avatar");
        user.setEmail("jane.doe@example.org");
        user.setId("42");
        user.setName("Name");
        user.setPassword("iloveyou");
        user.setRole(UserRole.CLIENT);
        Optional<User> ofResult = Optional.of(user);

        User user2 = new User();
        user2.setAvatar("Avatar");
        user2.setEmail("jane.doe@example.org");
        user2.setId("42");
        user2.setName("Name");
        user2.setPassword("iloveyou");
        user2.setRole(UserRole.CLIENT);
        when(userRepository.save(Mockito.<User>any())).thenReturn(user2);
        when(userRepository.findById(Mockito.<String>any())).thenReturn(ofResult);
        doNothing().when(validateMethods).validateObjectId(Mockito.<String>any());

        UserUpdateDTO dto = new UserUpdateDTO();
        dto.setEmail("jane.doe@example.org");
        dto.setName("Name");
        dto.setPassword("iloveyou");

        // Act
        UserDTO actualUpdateUserResult = userService.updateUser("42", dto);

        // Assert
        verify(validateMethods).validateObjectId("42");
        verify(userRepository).findById("42");
        verify(userRepository).save(isA(User.class));
        assertEquals("Avatar", actualUpdateUserResult.getAvatar());
        assertEquals("Name", actualUpdateUserResult.getName());
        assertEquals("jane.doe@example.org", actualUpdateUserResult.getEmail());
        assertNull(actualUpdateUserResult.getId());
        assertEquals(UserRole.CLIENT, actualUpdateUserResult.getRole());
    }

    /**
     * Test {@link UserService#updateUser(String, UserUpdateDTO)}.
     *
     * <ul>
     *   <li>Given {@link UserRepository}.
     *   <li>Then throw {@link EmailAlreadyUsedException}.
     * </ul>
     *
     * <p>Method under test: {@link UserService#updateUser(String, UserUpdateDTO)}
     */
    @Test
    @DisplayName(
            "Test updateUser(String, UserUpdateDTO); given UserRepository; then throw EmailAlreadyUsedException")
    @Tag("ContributionFromDiffblue")
    @ManagedByDiffblue
    @MethodsUnderTest({"UserDTO UserService.updateUser(String, UserUpdateDTO)"})
    void testUpdateUser_givenUserRepository_thenThrowEmailAlreadyUsedException() {
        // Arrange
        doThrow(new EmailAlreadyUsedException("An error occurred"))
                .when(validateMethods)
                .validateObjectId(Mockito.<String>any());

        UserUpdateDTO dto = new UserUpdateDTO();
        dto.setEmail("jane.doe@example.org");
        dto.setName("Name");
        dto.setPassword("iloveyou");

        // Act and Assert
        assertThrows(EmailAlreadyUsedException.class, () -> userService.updateUser("42", dto));
        verify(validateMethods).validateObjectId("42");
    }

    /**
     * Test {@link UserService#updateUser(String, UserUpdateDTO)}.
     *
     * <ul>
     *   <li>Then throw {@link UsernameNotFoundException}.
     * </ul>
     *
     * <p>Method under test: {@link UserService#updateUser(String, UserUpdateDTO)}
     */
    @Test
    @DisplayName("Test updateUser(String, UserUpdateDTO); then throw UsernameNotFoundException")
    @Tag("ContributionFromDiffblue")
    @ManagedByDiffblue
    @MethodsUnderTest({"UserDTO UserService.updateUser(String, UserUpdateDTO)"})
    void testUpdateUser_thenThrowUsernameNotFoundException() {
        // Arrange
        Optional<User> emptyResult = Optional.empty();
        when(userRepository.findById(Mockito.<String>any())).thenReturn(emptyResult);
        doNothing().when(validateMethods).validateObjectId(Mockito.<String>any());

        UserUpdateDTO dto = new UserUpdateDTO();
        dto.setEmail("jane.doe@example.org");
        dto.setName("Name");
        dto.setPassword("iloveyou");

        // Act and Assert
        assertThrows(UsernameNotFoundException.class, () -> userService.updateUser("42", dto));
        verify(validateMethods).validateObjectId("42");
        verify(userRepository).findById("42");
    }

    /**
     * Test {@link UserService#deleteUser(String)}.
     *
     * <p>Method under test: {@link UserService#deleteUser(String)}
     */
    @Test
    @DisplayName("Test deleteUser(String)")
    @Tag("ContributionFromDiffblue")
    @ManagedByDiffblue
    @MethodsUnderTest({"void UserService.deleteUser(String)"})
    void testDeleteUser() {
        // Arrange
        doThrow(new EmailAlreadyUsedException("An error occurred"))
                .when(userRepository)
                .deleteById(Mockito.<String>any());
        when(userRepository.existsById(Mockito.<String>any())).thenReturn(true);
        doNothing().when(validateMethods).validateObjectId(Mockito.<String>any());

        // Act and Assert
        assertThrows(EmailAlreadyUsedException.class, () -> userService.deleteUser("42"));
        verify(validateMethods).validateObjectId("42");
        verify(userRepository).deleteById("42");
        verify(userRepository).existsById("42");
    }

    /**
     * Test {@link UserService#deleteUser(String)}.
     *
     * <ul>
     *   <li>Given {@link UserRepository}.
     *   <li>Then throw {@link EmailAlreadyUsedException}.
     * </ul>
     *
     * <p>Method under test: {@link UserService#deleteUser(String)}
     */
    @Test
    @DisplayName(
            "Test deleteUser(String); given UserRepository; then throw EmailAlreadyUsedException")
    @Tag("ContributionFromDiffblue")
    @ManagedByDiffblue
    @MethodsUnderTest({"void UserService.deleteUser(String)"})
    void testDeleteUser_givenUserRepository_thenThrowEmailAlreadyUsedException() {
        // Arrange
        doThrow(new EmailAlreadyUsedException("An error occurred"))
                .when(validateMethods)
                .validateObjectId(Mockito.<String>any());

        // Act and Assert
        assertThrows(EmailAlreadyUsedException.class, () -> userService.deleteUser("42"));
        verify(validateMethods).validateObjectId("42");
    }

    /**
     * Test {@link UserService#deleteUser(String)}.
     *
     * <ul>
     *   <li>Then calls {@link KafkaUserProducer#sendUserDeletedEvent(String)}.
     * </ul>
     *
     * <p>Method under test: {@link UserService#deleteUser(String)}
     */
    @Test
    @DisplayName("Test deleteUser(String); then calls sendUserDeletedEvent(String)")
    @Tag("ContributionFromDiffblue")
    @ManagedByDiffblue
    @MethodsUnderTest({"void UserService.deleteUser(String)"})
    void testDeleteUser_thenCallsSendUserDeletedEvent() {
        // Arrange
        doNothing().when(kafkaUserProducer).sendUserDeletedEvent(Mockito.<String>any());
        doNothing().when(userRepository).deleteById(Mockito.<String>any());
        when(userRepository.existsById(Mockito.<String>any())).thenReturn(true);
        doNothing().when(validateMethods).validateObjectId(Mockito.<String>any());

        // Act
        userService.deleteUser("42");

        // Assert
        verify(kafkaUserProducer).sendUserDeletedEvent("42");
        verify(validateMethods).validateObjectId("42");
        verify(userRepository).deleteById("42");
        verify(userRepository).existsById("42");
    }

    /**
     * Test {@link UserService#deleteUser(String)}.
     *
     * <ul>
     *   <li>Then throw {@link ResourceNotFoundException}.
     * </ul>
     *
     * <p>Method under test: {@link UserService#deleteUser(String)}
     */
    @Test
    @DisplayName("Test deleteUser(String); then throw ResourceNotFoundException")
    @Tag("ContributionFromDiffblue")
    @ManagedByDiffblue
    @MethodsUnderTest({"void UserService.deleteUser(String)"})
    void testDeleteUser_thenThrowResourceNotFoundException() {
        // Arrange
        when(userRepository.existsById(Mockito.<String>any())).thenReturn(false);
        doNothing().when(validateMethods).validateObjectId(Mockito.<String>any());

        // Act and Assert
        assertThrows(ResourceNotFoundException.class, () -> userService.deleteUser("42"));
        verify(validateMethods).validateObjectId("42");
        verify(userRepository).existsById("42");
    }
}
