# Documentation du Portail Decade

## Vue d'ensemble
Le portail "Ocean Decade" est une application Web construite avec **Laravel 12** pour le backend et **React.js** (via Vite) pour le frontend. TailwindCSS gère la mise en forme. L'application permet de soumettre des demandes de développement des capacités et de mettre en relation les organisations partenaires.

### Technologies principales
- **Backend :** Laravel 12 (PHP 8.2+)
- **Frontend :** React.js avec Vite
- **Style :** TailwindCSS
- **Routage :** Routes Laravel côté serveur et React Router côté SPA via Inertia
- **Gestionnaire de paquets :** NPM

## Modèles principaux

### `Request`
```php
protected $fillable = [
    'request_data',
    'status_id',
    'user_id',
    'matched_partner_id',
];
```

### `Request\Detail`
```php
protected $fillable = [
    'request_id',
    'capacity_development_title',
    'is_related_decade_action',
    // ...
    'long_term_impact',
    'additional_data',
];

protected $casts = [
    'subthemes' => 'array',
    'support_types' => 'array',
    'target_audience' => 'array',
    'delivery_countries' => 'array',
];
```

### `Request\Offer`
```php
protected $fillable = [
    'request_id',
    'matched_partner_id',
    'description',
    'status',
];
```

### `Opportunity`
```php
protected $fillable = [
    'title',
    'type',
    'closing_date',
    'coverage_activity',
    'implementation_location',
    'target_audience',
    'summary',
    'url',
];
```

### `Document`
```php
protected $fillable = [
    'name',
    'path',
    'file_type',
    'document_type',
    'parent_id',
    'parent_type',
    'uploader_id',
];
```

D'autres modèles incluent `Notification`, `Setting` et divers modèles de données sous `app/Models/Data`.

## Structure de la base de données
Les migrations créent notamment :
- `requests` : table principale des demandes
- `request_details` : informations normalisées (certaines colonnes JSON)
- `request_offers` et `documents`
- `opportunities`
- `notifications` et `settings`

Les tables de normalisation initiales (ex. `subthemes`, `support_types`) ont été remplacées par des colonnes JSON dans `request_details`.

## Aperçu des routes
Les routes sont regroupées par rôle dans `routes/web.php` et `routes/auth.php`.

### Authentification
```php
Route::middleware('guest')->group(function () {
    Route::get('signin', [SessionController::class, 'create'])->name('sign.in');
    Route::post('signin', [SessionController::class, 'store'])->name('sign.in.post');
});
Route::middleware('auth')->group(function () {
    Route::post('signout', [SessionController::class, 'destroy'])->name('sign.out');
});
```

### Routes utilisateur
```php
Route::middleware(['auth', 'role:user'])->group(function () {
    Route::get('home', [HomeController::class, 'index'])->name('user.home');
    Route::get('user/request/create', [OcdRequestController::class, 'create'])->name('request.create');
    Route::get('request/me/list', [OcdRequestController::class, 'myRequestsList'])->name('request.me.list');
    // ...
});
```

### Routes partenaire
```php
Route::middleware(['auth', 'role:partner'])->group(function () {
    Route::get('opportunity/me/list', [OcdOpportunityController::class, 'mySubmittedList'])->name('opportunity.me.list');
    Route::get('opportunity/create', [OcdOpportunityController::class, 'create'])->name('partner.opportunity.create');
    // ...
});
```

### Routes administrateur
```php
Route::middleware(['auth', 'role:administrator'])->prefix('admin')->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('admin.dashboard.index');
    Route::get('settings', [SettingsController::class, 'index'])->name('admin.portal.settings');
    Route::get('request/list', [AdminOcdRequestController::class, 'list'])->name('admin.request.list');
    // ...
});
```

## Service `RequestService`
Le fichier `docs/REQUEST_SERVICE.md` décrit un service unique qui gère toute la logique liée aux demandes (création, brouillons, recherche). Il utilise des transactions et centralise la journalisation.

## Exemples de design patterns

### MVC
Les routes appellent des contrôleurs dédiés, séparant modèles et vues :
```php
Route::get('user/request/create', [OcdRequestController::class, 'create'])->name('request.create');
```

### Couche de service
`RequestService` regroupe la logique métier :
```php
public function storeRequest(User $user, array $data, ?OCDRequest $request = null): OCDRequest
{
    DB::beginTransaction();
    // ... création ou mise à jour
    DB::commit();
    return $request->load(['status', 'detail']);
}
```

### Observateur
`RequestObserver` réagit aux événements du modèle `Request` :
```php
public function created(Request $request): void
{
    Notification::create([
        'user_id' => 3,
        'title' => 'New Request Submitted',
        'description' => 'A new request has been submitted: ' . ($request->capacity_development_title ?? $request->id).
            ' By ' . ($request->user->name ?? 'Unknown User'),
        'is_read' => false,
    ]);
    $this->sendNewRequestEmails($request);
}
```

### Injection de dépendances
Les services sont injectés dans les contrôleurs :
```php
class OcdRequestController extends Controller
{
    public function __construct(
        private RequestService $service,
        private UserService $userService
    ) {}
}
```

### Fabrique (Factory)
Les factories génèrent des données de test :
```php
class UserFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
        ];
    }
}
```

### Chaîne de responsabilité (Middleware)
`HandleInertiaRequests` partage des données avec toutes les vues :
```php
public function share(Request $request): array
{
    return [
        ...parent::share($request),
        'auth' => ['user' => $request->user()],
        'unread_notifications' => $request->user()?->notifications()->where('is_read', false)->count() ?? 0,
    ];
}
```

### Façade
Utilisation de `Mail` et `Log` pour envoyer des emails et journaliser :
```php
Mail::to($recipient['email'])->send(new NewRequestSubmitted($request, $recipient));
Log::info('New request submission emails sent', ['request_id' => $request->id]);
```

### Contexte React (Provider)
Un contexte React gère l'état d'une boîte de dialogue :
```tsx
const DialogContext = createContext<DialogContextType | undefined>(undefined);

export function DialogProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DialogState>({ open: false, message: '', type: 'info' });
  const showDialog = (message: string, type: DialogState['type'] = 'info', onConfirm?: () => void) => {
    setState({ open: true, message, type, onConfirm });
  };
  const closeDialog = () => setState(s => ({ ...s, open: false }));
  return (
    <DialogContext.Provider value={{ showDialog, closeDialog }}>
      {children}
      <XHRAlertDialog
        open={state.open}
        onOpenChange={open => !open && closeDialog()}
        message={state.message}
        type={state.type}
        onConfirm={state.onConfirm}
      />
    </DialogContext.Provider>
  );
}
```

---
Cette documentation fournit une vue d'ensemble, en français, de l'architecture, des modèles, de la base de données, des routes et des principaux design patterns utilisés dans le projet.
