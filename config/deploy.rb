require 'bundler/capistrano'

set :domain, "208.94.246.186"
set :application, "cinch-notes"
set :deploy_to, "/var/www/apps/#{application}"

set :user, "girish"
set :use_sudo, false

ssh_options[:forward_agent] = true
set :scm, :git
set :repository, "git@github.com:cuberoot-sw/cinch-notes.git"
set :branch, 'master'
set :git_shallow_clone, 1

role :web, domain
role :app, domain
role :db, domain, :primary => true

set :deploy_via, :remote_cache

namespace :deploy do
  task :start do ; end
  task :stop do ; end
  # Assumes you are using Passenger
  task :restart, :roles => :app, :except => { :no_release => true } do
    run "#{try_sudo} touch #{File.join(current_path,'tmp','restart.txt')}"
    run <<-CMD
cd #{latest_release} && 
bundle exec thin stop -C config/production_config.yml &&
sleep 5 &&
cd #{latest_release} && 
bundle exec thin start -C config/production_config.yml
CMD
  end

  task :finalize_update, :except => { :no_release => true } do
    run "chmod -R g+w #{latest_release}" if fetch(:group_writable, true)

    # mkdir -p is making sure that the directories are there for some SCM's that don't save empty folders
    run <<-CMD
rm -rf #{latest_release}/log &&
mkdir -p #{latest_release}/public &&
ln -s #{shared_path}/log #{latest_release}/log
CMD

    if fetch(:normalize_asset_timestamps, true)
      stamp = Time.now.utc.strftime("%Y%m%d%H%M.%S")
      asset_paths = %w(images css).map { |p| "#{latest_release}/public/#{p}" }.join(" ")
      run "find #{asset_paths} -exec touch -t #{stamp} {} ';'; true", :env => { "TZ" => "UTC" }
    end
  end
end

after 'deploy:update_code' do
  run "cd #{release_path}  && ln -nsf #{shared_path}/config/production_config.yml #{release_path}/config/production_config.yml"
  run "cd #{release_path}  && ln -nsf #{shared_path}/config/config.yml #{release_path}/config/config.yml"
end

# 
# ln -sf /var/www/apps/cinch-notes/shared/config/production_config.yml /var/www/apps/cinch-notes/current/config/production_config.yml
# 
# ln -sf /var/www/apps/cinch-notes/shared/config/config.yml /var/www/apps/cinch-notes/current/config/config.yml
