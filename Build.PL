use strict;
use warnings;
use Module::Build;

$ENV{'PERL_MB_OPT'} = '--install-base=/usr'; # I could not make this work via the parameters below :/
$ENV{'DEB_BUILD_OPTIONS'}='nocheck';

use lib '../tm2_base/lib';
use lib '../templescript/lib';

my $debian = Module::Build->subclass(
    class => "Module::Build::Debian",
    code => <<'SUBCLASS' );

sub DEBVERSION {
    return 20;
}

sub ACTION_debian {
    my $self = shift;

    $self->depends_on("distdir");

    my $version = $self->dist_version;
    my $debversion = $self->DEBVERSION;
    $self->do_system(qq{   dh-make-perl --build --version=$version-$debversion TM2-Blog-$version } );

}
sub ACTION_inject {
    my $self = shift;

    $self->depends_on("debian");

    my $version = $self->dist_version;
    my $debversion = $self->DEBVERSION;
    $self->do_system(qq{ scp libtm2-blog-perl_${version}-${debversion}_all.deb packages.devc.at:packages/ } );
    foreach (qw(bullseye buster stretch) ) { # squeeze wheezy jessie 
        $self->do_system(qq{ ssh packages.devc.at -Y -t reprepro --ask-passphrase -b /var/www/packages/data/dists/ includedeb $_ packages/libtm2-blog-perl_${version}-${debversion}_all.deb });
    }
}
SUBCLASS


my $builder = $debian->new(
    module_name         => 'TM2::Blog',
    license             => 'perl',
    dist_author         => q{Robert Barta <rho@devc.at>},
    dist_version_from   => 'lib/TM2/Blog.pm',
    configure_requires  => { 'Module::Build' => 0 },
    build_requires => {
        'Test::More' => 0,
    },
    requires => {
        'TM2::TempleScript'   => 0,
        'Text::MultiMarkdown' => 0,
        'XML::Atom::SimpleFeed' => 0,
    },
    add_to_cleanup      => [ 'TM2-Blog-*' ],
    create_makefile_pl => 'traditional',
    onto_files          => {
                             'ontologies/blog.ts'        => 'ontologies/blog.ts',
                             'ontologies/markdown.ts'    => 'ontologies/markdown.ts',
                             'ontologies/publication.ts' => 'ontologies/publication.ts',
                             'ontologies/atom.ts' => 'ontologies/atom.ts',
    },
    install_path        => { 'ontologies' => '/usr/share/templescript/ontologies' },
);

$builder->add_build_element('onto');
$builder->create_build_script();
