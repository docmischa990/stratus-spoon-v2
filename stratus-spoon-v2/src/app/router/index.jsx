import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '@/app/layouts/AppLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

const HomePage = lazy(() => import('@/pages/home/HomePage').then((module) => ({ default: module.HomePage })))
const RecipesPage = lazy(() =>
  import('@/pages/recipes/RecipesPage').then((module) => ({ default: module.RecipesPage }))
)
const RecipeDetailsPage = lazy(() =>
  import('@/pages/recipes/RecipeDetailsPage').then((module) => ({ default: module.RecipeDetailsPage }))
)
const EditRecipePage = lazy(() =>
  import('@/pages/recipes/EditRecipePage').then((module) => ({ default: module.EditRecipePage }))
)
const CreateRecipePage = lazy(() =>
  import('@/pages/create/CreateRecipePage').then((module) => ({ default: module.CreateRecipePage }))
)
const CookbookPage = lazy(() =>
  import('@/pages/cookbook/CookbookPage').then((module) => ({ default: module.CookbookPage }))
)
const CookbookFolderPage = lazy(() =>
  import('@/pages/cookbook/CookbookFolderPage').then((module) => ({
    default: module.CookbookFolderPage,
  }))
)
const FavoritesPage = lazy(() =>
  import('@/pages/favorites/FavoritesPage').then((module) => ({ default: module.FavoritesPage }))
)
const MyRecipesPage = lazy(() =>
  import('@/pages/my-recipes/MyRecipesPage').then((module) => ({ default: module.MyRecipesPage }))
)
const ProfilePage = lazy(() =>
  import('@/pages/profile/ProfilePage').then((module) => ({ default: module.ProfilePage }))
)
const LoginPage = lazy(() => import('@/pages/login/LoginPage').then((module) => ({ default: module.LoginPage })))
const SignupPage = lazy(() =>
  import('@/pages/signup/SignupPage').then((module) => ({ default: module.SignupPage }))
)
const NotFoundPage = lazy(() =>
  import('@/pages/not-found/NotFoundPage').then((module) => ({ default: module.NotFoundPage }))
)

function withSuspense(element) {
  return (
    <Suspense
      fallback={
        <div className="container py-12">
          <div className="card-base p-6">
            <p className="text-sm text-text-muted">Loading page…</p>
          </div>
        </div>
      }
    >
      {element}
    </Suspense>
  )
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: withSuspense(<HomePage />) },
      { path: 'recipes', element: withSuspense(<RecipesPage />) },
      { path: 'recipes/:recipeId', element: withSuspense(<RecipeDetailsPage />) },
      {
        path: 'recipes/:recipeId/edit',
        element: (
          <ProtectedRoute>
            {withSuspense(<EditRecipePage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'create',
        element: (
          <ProtectedRoute>
            {withSuspense(<CreateRecipePage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'cookbook',
        element: (
          <ProtectedRoute>
            {withSuspense(<CookbookPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'cookbook/:collectionId',
        element: (
          <ProtectedRoute>
            {withSuspense(<CookbookFolderPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'favorites',
        element: (
          <ProtectedRoute>
            {withSuspense(<FavoritesPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'my-recipes',
        element: (
          <ProtectedRoute>
            {withSuspense(<MyRecipesPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            {withSuspense(<ProfilePage />)}
          </ProtectedRoute>
        ),
      },
      { path: 'login', element: withSuspense(<LoginPage />) },
      { path: 'signup', element: withSuspense(<SignupPage />) },
      { path: '*', element: withSuspense(<NotFoundPage />) },
    ],
  },
])
