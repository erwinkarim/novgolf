Rails.application.routes.draw do
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html

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

  #manage users
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
    resources :memberships
  end

  #public view for reservation
  resources :reservations, :only => [], :controller => "user_reservations" do
    get '/' => 'user_reservations#public_view'
  end
  #to manage golf clubs
  namespace :admin do
    get '/' => "admin#index"
    resources :dashboard, :only => [:index] do
      collection do
        get 'recreate_versions'
      end
    end
    resources :billings, :only => [:index] do
      collection do
        resources :invoices, :only => [:index, :show]
        get 'settings'
      end
      #manage user billings
    end
    resources :golf_clubs do
      get 'dashboard'
      get 'tax_schedule'
      get 'flights'
      resources :photos, :only => [:index, :create, :update, :destroy] do
        collection do
          patch 'update_sequence'
        end
      end
      #this is for MVP + 1
      #resources :charge_schedules, :only => [:index]
      resources :memberships, :only => [:index, :show, :destroy]
      collection do
        get 'tax_schedules'
      end
      resources :courses, controller:'course_listings', :only => [:index,:update] do
        collection do
          patch 'global_setting' => 'course_listings#update_global_setting'
          get 'statuses'
          get 'defaults'
        end
      end
    end
    resources :user_reservations, :only => [:create, :show, :destroy, :update], constraints: {format:'json'} do
      post 'pay'
      post 'confirm_members'
      get 'notify'
      collection do
        post 'stats'
      end
      resources :ur_transactions, :only => [:index]
      resources :ur_contacts, :only => [] do
        collection do
          post '/' => 'ur_contacts#ur_contact_update'
          patch '/' => 'ur_contacts#ur_contact_update'
        end
      end
    end
    resources :contacts, controller:'ur_contacts' do
      collection do
        get 'suggest'
        get 'load'
      end
    end
  end

  # monolith is the superadmin, just like the monolith in space oddessy
  namespace :monolith do
    get '/' => "monolith#index"
    resources :invoices, :only => [:index,:update, :edit, :show] do
      collection do
        post 'generate' => 'invoices#generate'
        get 'load' => 'invoices#load'
        get 'stats' => 'invoices#stats'
      end
      get 'settlement'
      post 'settlement' => 'invoices#place_settlement'
    end
  end

  namespace :operator do
    controller :operator do
      get '/' => 'operator#index'
      get 'console' => 'operator#turk_console'
      resources :user_reservations, :only => [:index, :show] do
        post 'assign_to_me'
        post 'confirm'
        post 'cancel'
        post 'propose_new_time'
      end
    end
  end

  namespace :invoke do
    controller :jobs do
      get 'invoices'
    end
  end

  resources :golf_clubs, :only => [:index, :show] do
    get 'open_courses'
    resources :flight_matrices, :only => [:index]
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
  end

  resources :amenities, :only => [:index]
end
