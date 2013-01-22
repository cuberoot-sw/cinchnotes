require 'bundler/capistrano'

set :domain, "208.94.246.186"
set :application, "cinch-notes"
set :deploy_to, "/var/www/apps/#{application}"

set :user, "girish"
set :use_sudo, false

ssh_options[:forward_agent] = true
set :scm, :git
set :repository, "git@github.com:cuberoot-sw/cinch-notes.git"
set :branch, 'new_layout'
set :git_shallow_clone, 1

role :web, domain
role :app, domain
role :db, domain, :primary => true

set :deploy_via, :remote_cache

desc "Symlink the database config file from shared directory to current release directory." 
task :symlink_database_yml do
  run "cd #{release_path} && ln -nsf #{shared_path}/config/database.yml #{release_path}/config/database.yml"
  run "ln -nsf #{shared_path}/production.rb #{release_path}/config/environments/production.rb" 
end 

after :deploy, 'symlink_database_yml'
 
namespace :deploy do
  task :restart do
    # Hide default restart task
    run "touch #{current_path}/tmp/restart.txt"
  end
end