
@RestController
@RequestMapping("/api/users")
@PreAuthorize("hasAnyRole('CLIENT', 'SELLER'), 'ADMIN'") // Autorise l'accès aux utilisateurs ayant les rôles CLIENT, ADMIN ou SELLER
public class UserController {

    @Autowired
    private UserService userService;

    // Récupérer un utilisateur par son ID
    @GetMapping("/{id}")
    @PostAuthorize("returnObject?.getBody()?.id == authentication.principal.id or hasRole('ADMIN')") // Autorise l'accès si l'utilisateur est l'utilisateur demandé ou s'il a le rôle ADMIN
    public ResponseEntity<UserDTO> getUserById(@PathVariable String id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    // Modifier un utilisateur
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.id") // Autorise l'accès si l'utilisateur est l'utilisateur demandé ou s'il a le rôle ADMIN
    public ResponseEntity<UserDTO> updateUser(@PathVariable String id, @Valid @RequestBody UserUpdateDTO dto) {
        return ResponseEntity.ok(userService.updateUser(id, dto));
    }
}