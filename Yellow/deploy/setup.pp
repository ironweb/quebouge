# Fichier Puppet pour l'installation (et la mise à jour)
# Piloté par le "fabfile.py" de ce répertoire (pip install Fabric)

package {
  "python-setuptools":  ensure => present;
  "python-virtualenv":  ensure => present;
  "python-pip":  ensure => present;
  "python-psycopg2":  ensure => present;
  "python-dev":  ensure => present;    # to compile coverage, etc..
  "build-essential":  ensure => present;
  "git-core":  ensure => present;
  "emacs":  ensure => present;
  "apache2":  ensure => present;
  "postgresql-9.1-postgis":  ensure => present;
  "postgis":  ensure => present;
  "postgresql-server-dev-all":  ensure => present;
  "openjdk-7-jre-headless":  ensure => present;
  "lxml2-dev":  ensure => present;
  "libxslt1-dev":  ensure => present;
}

service {
  apache2:
    ensure => running,
    enable => true,
    require => Package["apache2"];
}
