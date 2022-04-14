md  isa ontology ~ http://templescript.org/ns/markdown/

lang:markdown ~ urn:x-mime:text/markdown

md:indent isa ts:function
return """
  my $s = $_[0]->[0];
#warn ">>>>$s<<<<";
  $s =~ s/\n/\n    /gs;
#warn ">>>>$s<<<<";
  return TM2::Literal->new ($s, 'http://templescript.org/ns/lang/markdown');
""" ^^ lang:perl !

md:lead isa ts:function
return """
  my $s = $_[0]->[0];
# warn "md:lead original ".Dumper $_[0];
  $s =~ s/((\!.+?\n)?([^\n]+?))(\n\n+.*)/$1/s;
  $s .= $4 ? " ...\n" : "\n";
# warn "md:lead original after ".Dumper $_[0];
  return TM2::Literal->new ($s, 'http://templescript.org/ns/lang/markdown');
""" ^^ lang:perl !


§ isa ts:converter
ts:mimetype @ ts:input  : "text/markdown"
ts:mimetype @ ts:output : "text/html;fragment=1"
returns """
#warn "converter md -> html frag";
  my $markdown = $_[0]->[0];
#warn "  converting from '$markdown'";
  use Text::MultiMarkdown 'markdown';
  my $html = markdown ($markdown);
  $html =~ s{\\#}{#}gs;
  my $colorify = sub {
     my (undef, $s) = @_;
     $s =~ s{"(.*?)"}{"<span class="ts_string">$1</span>"}g;
     $s =~ s{\b(identity|tee|uniq|zigzag|zagzig|count|negate|demote|promote|classify|aggregate)\b}{<span class="ts_keyword">$1</span>}g;
     $s =~ s{((&lt;)?~\[)(.+?)(\]~(&gt;)?)}{<span class="ts_op">$1</span><span class="ts_mime">$3</span><span class="ts_op">$4</span>}g;
     $s =~ s{((--|\+\+|=|==)(&gt;))}{<span class="ts_assign">$1</span>}g;
     $s =~ s{(\$\w+)}{<span class="ts_variable">$1</span>}g;
     return qq{<code class="templescript">$s</code>};
  };
  $html =~ s{(<code>.templescript\n(.*?)</code>)}{&$colorify ($1, $2)}egs;
  $html =~ s{<p>(.+?)\{\.(\w+)\}</p>}{<p class="$2">$1</p>}gs;         # pandoc CSS
#warn "  converting to '$html'";
#warn "  original ".Dumper $_[0];
  return TM2::Literal->new ($html, TM2::TempleScript->LANG . 'html-fragment');
""" ^^ lang:perl !

md:sum isa ts:overloaded
    isa ts:operator
! @ math:infix : ++
  ts:profile_in  : "text/markdown *"
  ts:profile_out : "text/markdown"
return """
    my $s;
#warn "md:sum!!!!!!!!!!!!!!";
    foreach my $m (@_) {
       $s .= $m->[0];
    }
#warn "sum markdown $s";
    return TM2::Literal->new ($s, 'http://templescript.org/ns/lang/markdown');
""" ^^ lang:perl !

