atom  isa ontology ~ http://templescript.org/ns/atom/

lang:atom ~ urn:x-mime:application/atom+xml

atom:gen isa ts:function
         isa ts:open-function
return """
   package XML::Atom::SimpleFeed::withMIME;
      use parent 'XML::Atom::SimpleFeed';
      sub mime { return "application/binary+atom"; }
   1;

#use Data::Dumper;
#warn "atom params".Dumper \@_;

   my ($title, $url, $author, $entries) = @_;

   use URI;
   my $aurl  = URI->new_abs('atom', $url->[0]);

   my $feed = XML::Atom::SimpleFeed::withMIME->new(
     title   => $title->[0],
     link    => $url->[0],
     link    => { rel => 'self', href => "$aurl", },
     updated => _to_Tdate (time()),
     author  => $author,
     id      => $url->[0],
     generator => 'TempleScript Atom Generator 0.1 (via XML::Atom::SimpleFeed)',
   );

   foreach my $e (@$entries) { 
     my ($id, $title, $lead, $updated, $author) = @$e;
     my $eurl  = URI->new_abs($id, $aurl);
     $feed->add_entry(
         title     => $title->[0],
         link      => "$eurl",
         id        => "$eurl",
         summary   => $lead->[0],
         author    => $author,
         updated   => _to_Tdate ($updated->[0]),
     );
   }

#warn "mime ".$feed->mime;
#use Data::Dumper;
#warn "atom ".Dumper $feed;
   return TM2::Literal->new ($feed->as_string, 'urn:x-mime:application/xml+atom');

sub _to_Tdate {
    my $t = shift;
    use POSIX qw(strftime);
    my @t = localtime ($t);
    return strftime $t[0] == 0 ? "%Y-%m-%dT%H:%M" : "%Y-%m-%dT%H:%M:%S", @t;
}
""" ^^ lang:perl !

