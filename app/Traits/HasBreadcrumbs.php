<?php

namespace App\Traits;

/**
 * Trait HasBreadcrumbs
 *
 * Provides standardized breadcrumb generation for controllers
 * Ensures consistent navigation breadcrumbs across the application
 */
trait HasBreadcrumbs
{
    /**
     * Generate home breadcrumb (first level)
     *
     * @return array
     */
    protected function getHomeBreadcrumb(): array
    {
        return ['name' => 'Home', 'url' => route('user.home')];
    }

    /**
     * Generate admin dashboard breadcrumb (first level for admin pages)
     *
     * @return array
     */
    protected function getAdminDashboardBreadcrumb(): array
    {
        return ['name' => 'Dashboard', 'url' => route('admin.dashboard.index')];
    }

    /**
     * Generate requests section breadcrumb
     *
     * @param bool $isAdmin Whether this is for admin context
     * @return array
     */
    protected function getRequestsSectionBreadcrumb(bool $isAdmin = false): array
    {
        $url = $isAdmin ? route('admin.request.list') : route('request.me.list');
        return ['name' => 'Requests', 'url' => $url];
    }

    /**
     * Generate opportunities section breadcrumb
     *
     * @param bool $isAdmin Whether this is for admin context
     * @return array
     */
    protected function getOpportunitiesSectionBreadcrumb(bool $isAdmin = false): array
    {
        $url = $isAdmin ? route('admin.opportunity.list') : route('opportunity.list');
        return ['name' => 'Opportunities', 'url' => $url];
    }

    /**
     * Generate notifications section breadcrumb
     *
     * @return array
     */
    protected function getNotificationsSectionBreadcrumb(): array
    {
        return ['name' => 'Notifications', 'url' => route('admin.notifications.index')];
    }

    /**
     * Generate users section breadcrumb
     *
     * @return array
     */
    protected function getUsersSectionBreadcrumb(): array
    {
        return ['name' => 'Users', 'url' => route('admin.users.roles.list')];
    }

    /**
     * Generate settings section breadcrumb
     *
     * @return array
     */
    protected function getSettingsSectionBreadcrumb(): array
    {
        return ['name' => 'Settings', 'url' => route('admin.settings.index')];
    }

    /**
     * Generate a specific request breadcrumb
     *
     * @param int $requestId
     * @param string $action (view, edit, preview)
     * @param bool $isAdmin
     * @return array
     */
    protected function getRequestBreadcrumb(int $requestId, string $action = 'view', bool $isAdmin = false): array
    {
        $actions = [
            'view' => ['name' => "View Request #{$requestId}", 'route' => 'request.show'],
            'edit' => ['name' => "Edit Request #{$requestId}", 'route' => 'request.edit'],
            'preview' => ['name' => "Preview Request #{$requestId}", 'route' => 'request.preview'],
        ];

        $actionData = $actions[$action] ?? $actions['view'];

        // Map admin routes to actual route names
        $adminRouteMapping = [
            'admin.request.show' => 'admin.request.show',
            'admin.request.edit' => 'admin.request.edit', // May not exist
            'admin.request.preview' => 'admin.request.preview', // May not exist
        ];

        $route = $isAdmin ? ($adminRouteMapping["admin.{$actionData['route']}"] ?? $actionData['route']) : $actionData['route'];

        return [
            'name' => $actionData['name'],
            'url' => $isAdmin && $action === 'show' ? route($route, ['request' => $requestId]) : route($route, ['id' => $requestId])
        ];
    }

    /**
     * Generate a specific request breadcrumb
     *
     * @param int $requestId
     * @param string $action (view, edit, preview)
     * @param bool $isAdmin
     * @return array
     */
    protected function getOffersBreadcrumb(int $requestId, string $action = 'view', bool $isAdmin = false): array
    {
        $actions = [
            'view' => ['name' => "View Offer #{$requestId}", 'route' => 'request.show'],
            'edit' => ['name' => "Edit Offer #{$requestId}", 'route' => 'request.edit'],
            'preview' => ['name' => "Preview Request #{$requestId}", 'route' => 'request.preview'],
        ];

        $actionData = $actions[$action] ?? $actions['view'];

        // Map admin routes to actual route names
        $adminRouteMapping = [
            'admin.request.show' => 'admin.request.show',
            'admin.request.edit' => 'admin.request.edit', // May not exist
            'admin.request.preview' => 'admin.request.preview', // May not exist
        ];

        $route = $isAdmin ? ($adminRouteMapping["admin.{$actionData['route']}"] ?? $actionData['route']) : $actionData['route'];

        return [
            'name' => $actionData['name'],
            'url' => $isAdmin && $action === 'show' ? route($route, ['request' => $requestId]) : route($route, ['id' => $requestId])
        ];
    }

    /**
     * Generate a specific opportunity breadcrumb
     *
     * @param int $opportunityId
     * @param string $action (view, edit)
     * @param bool $isAdmin
     * @return array
     */
    protected function getOpportunityBreadcrumb(int $opportunityId, string $action = 'view', bool $isAdmin = false): array
    {
        $actions = [
            'view' => ['name' => "View Opportunity #{$opportunityId}", 'route' => 'opportunity.show'],
            'edit' => ['name' => "Edit Opportunity #{$opportunityId}", 'route' => 'opportunity.edit'],
        ];

        $actionData = $actions[$action] ?? $actions['view'];
        $route = $isAdmin ? "admin.{$actionData['route']}" : $actionData['route'];

        return [
            'name' => $actionData['name'],
            'url' => route($route, ['id' => $opportunityId])
        ];
    }

    /**
     * Generate create action breadcrumb
     *
     * @param string $type (Request, Opportunity)
     * @param bool $isAdmin
     * @return array
     */
    protected function getCreateBreadcrumb(string $type, bool $isAdmin = false): array
    {
        $routes = [
            'Request' => $isAdmin ? 'admin.request.create' : 'request.create',
            'Opportunity' => $isAdmin ? 'admin.opportunity.create' : 'partner.opportunity.create',
        ];

        $route = $routes[$type] ?? null;
        $breadcrumb = ['name' => "Create {$type}"];

        if ($route && \Route::has($route)) {
            $breadcrumb['url'] = route($route);
        }

        return $breadcrumb;
    }

    /**
     * Generate notification breadcrumb
     *
     * @param string $title
     * @param int|null $notificationId
     * @return array
     */
    protected function getNotificationBreadcrumb(string $title, ?int $notificationId = null): array
    {
        $breadcrumb = ['name' => $title];

        if ($notificationId) {
            $breadcrumb['url'] = route('admin.notifications.show', ['notification' => $notificationId]);
        }

        return $breadcrumb;
    }

    /**
     * Build complete breadcrumb trail for user pages
     *
     * @param array $breadcrumbs Additional breadcrumbs after Home
     * @return array
     */
    protected function buildUserBreadcrumbs(array $breadcrumbs = []): array
    {
        return array_merge([$this->getHomeBreadcrumb()], $breadcrumbs);
    }

    /**
     * Build complete breadcrumb trail for admin pages
     *
     * @param array $breadcrumbs Additional breadcrumbs after Dashboard
     * @return array
     */
    protected function buildAdminBreadcrumbs(array $breadcrumbs = []): array
    {
        return array_merge([$this->getAdminDashboardBreadcrumb()], $breadcrumbs);
    }

    /**
     * Build request-related breadcrumbs
     *
     * @param string $action (list, create, show, edit, preview)
     * @param int|null $requestId Required for show, edit, preview actions
     * @param bool $isAdmin
     * @return array
     */
    protected function buildRequestBreadcrumbs(string $action, ?int $requestId = null, bool $isAdmin = false): array
    {
        $base = $isAdmin ? [$this->getAdminDashboardBreadcrumb()] : [$this->getHomeBreadcrumb()];
        $requestsSection = $this->getRequestsSectionBreadcrumb($isAdmin);

        switch ($action) {
            case 'list':
                return array_merge($base, [$requestsSection]);

            case 'create':
                return array_merge($base, [$requestsSection, $this->getCreateBreadcrumb('Request', $isAdmin)]);

            case 'show':
            case 'edit':
            case 'preview':
                if (!$requestId) {
                    throw new \InvalidArgumentException("Request ID is required for {$action} action");
                }
                return array_merge($base, [$requestsSection, $this->getRequestBreadcrumb($requestId, $action, $isAdmin)]);

            default:
                return array_merge($base, [$requestsSection]);
        }
    }

    /**
     * Build opportunity-related breadcrumbs
     *
     * @param string $action (list, create, show, edit)
     * @param int|null $opportunityId Required for show, edit actions
     * @param bool $isAdmin
     * @return array
     */
    protected function buildOpportunityBreadcrumbs(string $action, ?int $opportunityId = null, bool $isAdmin = false): array
    {
        $base = $isAdmin ? [$this->getAdminDashboardBreadcrumb()] : [$this->getHomeBreadcrumb()];
        $opportunitiesSection = $this->getOpportunitiesSectionBreadcrumb($isAdmin);

        switch ($action) {
            case 'list':
                return array_merge($base, [$opportunitiesSection]);

            case 'create':
                return array_merge($base, [$opportunitiesSection, $this->getCreateBreadcrumb('Opportunity', $isAdmin)]);

            case 'show':
            case 'edit':
                if (!$opportunityId) {
                    throw new \InvalidArgumentException("Opportunity ID is required for {$action} action");
                }
                return array_merge($base, [$opportunitiesSection, $this->getOpportunityBreadcrumb($opportunityId, $action, $isAdmin)]);

            default:
                return array_merge($base, [$opportunitiesSection]);
        }
    }

    /**
     * Build notification-related breadcrumbs
     *
     * @param string $action (list, show)
     * @param string|null $title Required for show action
     * @param int|null $notificationId Required for show action
     * @return array
     */
    protected function buildNotificationBreadcrumbs(string $action, ?string $title = null, ?int $notificationId = null): array
    {
        $base = [$this->getAdminDashboardBreadcrumb()];
        $notificationsSection = $this->getNotificationsSectionBreadcrumb();

        switch ($action) {
            case 'list':
                return array_merge($base, [$notificationsSection]);

            case 'show':
                if (!$title) {
                    throw new \InvalidArgumentException("Title is required for show action");
                }
                return array_merge($base, [$notificationsSection, $this->getNotificationBreadcrumb($title, $notificationId)]);

            default:
                return array_merge($base, [$notificationsSection]);
        }
    }

    /**
     * Build admin-specific breadcrumbs
     *
     * @param string $section (users, settings, dashboard)
     * @param array $additional Additional breadcrumbs
     * @return array
     */
    protected function buildAdminSectionBreadcrumbs(string $section, array $additional = []): array
    {
        $base = [$this->getAdminDashboardBreadcrumb()];

        $sections = [
            'users' => $this->getUsersSectionBreadcrumb(),
            'settings' => $this->getSettingsSectionBreadcrumb(),
            'dashboard' => [], // Dashboard is already the base
        ];

        $sectionBreadcrumb = $sections[$section] ?? [];
        $breadcrumbs = $base;

        if (!empty($sectionBreadcrumb)) {
            $breadcrumbs[] = $sectionBreadcrumb;
        }

        return array_merge($breadcrumbs, $additional);
    }
}
