# perl -Ilib -I../tm2_base/lib -Ilib -I../templescript/lib/ ../templescript/bin/ts --map=rho-blog.ts --restless --ur-path=../templescript/ontologies/ --log-level=DEBUG

#-- REST endpoint

%include file:web.ts

%include file:rest.ts

resty isa ts:stream
return
   < http://localhost:8888/ >- |->> rest:response |->> web:respond-minimal | null


%include file:blog.ts

#-- content ---------------------------------

post-000 isa blog:post
! This is my first
return """
  blablabablabal
""" ^^ lang:markdown

post-001 isa blog:post
! this is another
return """
* erster
* zweiter
* dritter
""" ^^ lang:markdown

index isa web:resource
return
  (
         for $p in blog:post >> instances
         return
             """*  [{{{ $p / name }}}](/{{{$p}}})
""" ^^ lang:markdown
  ) | Sigma

#-- layouting ------------------------------

* isa ts:converter
ts:mimetype @ ts:input  : text/html-fragment
ts:mimetype @ ts:output : text/html;nofragment=1
returns """<html>
  <head>
     <title>TempleScript</title>
     <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  </head>
  <body>
     <div id="header">
         <h2>TempleScript</h2>
	          <h3>Programming For Gods</h3>
     </div>
     <div>
        {{{ $0 }}}
     </div>
     <div id="navigation">
         <a href="/index">Home</a>
         <a href="/rationale">Rationale</a>
     </div>
  </body>
</html>""" ^^ lang:html


rationale isa web:resource
return """
tbw
""" ^^ lang:markdown

#-- test ------------------

xxx isa special-page
return """
<b>SPECIAL</b>
"""

yyy isa ts:function
return "YYY" ^^ lang:html-fragment

isa web:rendering:
   class        : special-page
   web:template : yyy


sum-html isa ts:overloaded
    isa ts:operator
! @ ts:infix : ++
  ts:profile_in  : text/html *
  ts:profile_out : text/html
return """
    my $s;
    foreach my $m (@_) {
       $s .= $m->[0];
    }
    return TM2::Literal->new ($s, 'http://templescript.org/ns/lang/html');
""" ^^ lang:perl !

%cancel


index isa web:queryable-resource
return <blog:list pagination>{
     for $b in %_ // blog:post
     return
          <blog:entry href="{ $b }">{ $b / name }</blog:entry>
}</blog:list> ^^ text/blog-xml

* isa ts:converter
ts:mime-type @ ts:input  : text/blog-xml
ts:mime-type @ ts:output : text/html;layout=none
returns """
    <xslt .....>
""" ^^ lang:xslt !

* isa ts:converter
! global layout wrapper
ts:mime-type @ ts:input  : text/html;layout=none
ts:mime-type @ ts:output : text/html;layout=done
returns """
    <xslt .....>
""" ^^ lang:xslt !

