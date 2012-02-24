#!/usr/bin/env python
# -=- encoding: utf-8 -=-
import os, sys
from datetime import datetime
from fabric.api import run, sudo, env, task, put, get, local, hosts, cd, prefix
from fabric.api import settings, open_shell, hide, prompt, lcd
from fabric.colors import red, green, yellow
from fabric.contrib.files import sed, exists

# Define roles
env.roledefs['prod'] = ["root@108.166.78.17"]
env.roledefs['dev'] = ["root@108.166.78.17"]

root_access = 'root@108.166.78.17'

# Role we asked for on command line (ex: fab -R prod restart)
role = env.roles[0] if env.roles else None

configs = {
    'prod': {},
    'dev': {},
    }
conf = configs.get(role)


@task
def bootstrap():
    # Install puppet and configure the machine
    sudo("apt-get install puppet")
    put('setup.pp', '/tmp/setup.pp')
    sudo("puppet -vvv /tmp/setup.pp")
    sudo("rm /tmp/setup.pp")
    sudo("pip install --upgrade virtualenv pip")


def shellesc(cmd):
    return cmd.replace("'", "'\\''")

def run_as_app(cmd):
    sudo(cmd, user='jaunes')


@task
def push_init_script():
    run("scp %s/init.d.script %s:/etc/init.d/quebouge-%s" % (role, root_access,
                                                             role))
    run("ssh ironweb chmod +x /etc/init.d/quebouge-%s" % (role))
    

@task
def push_apache_config(restart=False):
    """With ``restart`` equal to True, it will only restart if required."""
    # TODO: doesn't push a particular version of the apache config,
    #       only the one in the current directory..  Might not be in sync with
    #       a release.
    apache_conf = '/etc/apache2/sites-available/quebouge-%s.conf' % role
    local_conf = "%s/apache2-vhost.conf" % role
    # Compare the two configs.
    if not exists(apache_conf) or \
            run("md5sum %s|cut -f1 -d' '" % apache_conf) != \
            local("md5sum %s|cut -f1 -d' '" % local_conf, capture=True):
        put(local_conf, "/tmp/tmpconf")
        sudo("mv /tmp/tmpconf %s" % apache_conf)
        sudo("a2ensite quebouge-%s.conf" % role)
        sudo("/etc/init.d/apache2 reload")

    if restart:
        res = sudo("a2enmod proxy_http")
        if 'restart' in res:
            sudo("/etc/init.d/apache2 restart")
    
@task
def install_update_virtenv():
    with cd("/home/jaunes/quebouge-%s" % role):

        # Create env if it doesn't exist already
        if not exists("env"):
            run_as_app("virtualenv --system-site-packages env")

        run_as_app("mkdir -p /home/jaunes/.pip")
        # Install the requirements.
        run_as_app("PIP_DOWNLOAD_CACHE=/home/jaunes/.pip /home/jaunes/quebouge-%s/env/bin/pip install -r Yellow/requirements.freeze" % (role))
        run_as_app("/home/jaunes/quebouge-%s/env/bin/python Yellow/setup.py develop" % (role))


@task
def install():
    setup_tracking_branches()

    # Put the git repository up there
    if not exists("/home/jaunes/quebouge-%s" % role):
        run_as_app("mkdir -p /home/jaunes/quebouge-%s" % role)

        with cd("/home/jaunes/quebouge-%s" % role):
            run_as_app("git init")
            push_git_hooks()

        local("git branch -f %s HEAD" % role) # branch name
        local("git push %s" % role) # remote, using the same name for branch

    # Ensure the data templates and sessions paths exist
    run_as_app("mkdir -p /home/jaunes/quebouge-%s/data/templates" % role)
    run_as_app("mkdir -p /home/jaunes/quebouge-%s/data/sessions" % role)

    install_update_virtenv()

    print green("INSTALLATION DONE")
    

@task
def restart():
    print green("Restarting...")
    run("/etc/init.d/quebouge-%s restart" % role)
@task
def start():
    print green("Starting...")
    run("/etc/init.d/quebouge-%s start" % role)
@task
def stop():
    print green("Stopping...")
    run("/etc/init.d/quebouge-%s stop" % role)


    
@task
@hosts("jaunes@108.166.78.17")
def setup_tracking_branches():
    print green("Setting up %s branches and git hooks over there" % role)
    with settings(warn_only=True):
        local("git remote add %s jaunes@108.166.78.17:/home/jaunes/quebouge-%s" % (role, role))
    local("git config remote.%s.fetch +refs/heads/master:refs/remotes/%s/master" % (role, role))
    local("git config remote.%s.push +refs/heads/%s:refs/heads/master" % (role, role))


@task
def push_git_hooks():
    with cd("/home/jaunes/quebouge-%s" % role):
        put("%s/git-post-receive" % role, ".git/hooks/post-receive")
        run("chmod +x .git/hooks/post-receive")
        run("git config receive.denyCurrentBranch false")



@task
def push(commit='HEAD'):
    if not commit:
        print red("Please specify a branch to push, ex: fab -R dev push:0.1.2")
        sys.exit(1)

    local("git branch -f %s %s" % (role, commit))
    local("git push %s" % role) # sends the 'dev' branch to master up there..
    # with the git hooks correctly set up.. we should have everythign reset.
    # we should have errors when the "push" can't be done, because of non-fast-
    # forward changes.

    install_update_virtenv()

    # Restart the server for this environment.
    restart()

@task
def re_populate_database():
    with cd("/home/jaunes/quebouge-%s" % role):
        run_as_app("env/bin/populate_Yellow prod.ini")

