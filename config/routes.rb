Rails.application.routes.draw do
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html

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
     get '/' => "admin#index"
     resources :dashboard, :only => [:index] do
       collection do
         get 'recreate_versions'
       end
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
     end
     resources :user_reservations, :only => [:create, :show, :destroy, :update], constraints: {format:'json'} do
       post 'pay'
       post 'confirm_members'
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

   resources :golf_clubs, :only => [:index, :show] do
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
end
