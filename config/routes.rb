Rails.application.routes.draw do
  get 'users/show'

  devise_for :users, :controllers => { :omniauth_callbacks => "users/omniauth_callbacks" }
  resources :users, :only => [:show, :edit, :update] do
    get 'profile_picture'
    post 'profile_picture', :to => "users#update_profile_picture"
    resources :reservations, :only => [:show], :controller => "user_reservations" do
      collection do
        get '/' => 'user_reservations#user_index'
      end
    end
    resources :reviews
  end
  #devise_scope :user do
  #  delete 'sign_out', :to => 'devise/sessions#destroy', :as => :destroy_user_session
  #end

  # The priority is based upon order of creation: first created -> highest priority.
  # See how all your routes lay out with "rake routes".

  # You can have the root of your site routed with "root"
  root 'welcome#index'
  controller :welcome do
    get 'search'
    get 'reset'
    get 'session_data'
    get 'tab_test'
    get 'suggest'
  end

  #to manage golf clubs
  namespace :admin do
    resources :dashboard, :only => [:index] do
      collection do
        get 'recreate_versions'
      end
    end
    resources :golf_clubs do
      get 'dashboard'
      get 'tax_schedule'
      resources :photos, :only => [:index, :create, :update, :destroy]
      #this is for MVP + 1
      #resources :charge_schedules, :only => [:index]
    end
    resources :user_reservations, :only => [:create, :show, :destroy, :update], constraints: {format:'json'} do
      post 'confirm'
    end
  end

  resources :golf_clubs, :only => [:show] do
    resources :flight_matrices, :only => [:index] do
    end
    resources :user_reservations, :only => [:index] do
      collection do
        post 'reserve'
        get 'reserve'
        post 'processing'
        post 'confirmation'
        get 'failure'
      end
    end
    resources :reviews, :only => [] do
      collection do
        get '/' => "reviews#club_reviews"
      end
    end
    collection do
    end
  end

  resources :amenities, :only => [:index] do
  end

  # Example of regular route:
  #   get 'products/:id' => 'catalog#view'

  # Example of named route that can be invoked with purchase_url(id: product.id)
  #   get 'products/:id/purchase' => 'catalog#purchase', as: :purchase

  # Example resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Example resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Example resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Example resource route with more complex sub-resources:
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', on: :collection
  #     end
  #   end

  # Example resource route with concerns:
  #   concern :toggleable do
  #     post 'toggle'
  #   end
  #   resources :posts, concerns: :toggleable
  #   resources :photos, concerns: :toggleable

  # Example resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end
end
