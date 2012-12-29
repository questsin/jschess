<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<html>
	<head>
		<meta charset="UTF-8">
		<title>Demo1 - Using the jschess-[ver].min.js distribution</title>
		<link rel="shortcut icon" href="favicon.ico"/>
		<!-- third parties -->
${jsThirdParty()}
		<script src="../out/jschess-${ver}.min.js"></script>

		<!-- syntax highlighter stuff -->
		<!-- Include required JS files -->
		<script type="text/javascript" src="../thirdparty/sh/scripts/shCore.js"></script>
		<!--
			At least one brush, here we choose JS. You need to include a brush for every
			language you want to highlight
		-->
		<script type="text/javascript" src="../thirdparty/sh/scripts/shBrushJScript.js"></script>
		<script type="text/javascript" src="../thirdparty/sh/scripts/shBrushXml.js"></script>
		<!-- Include *at least* the core style and default theme -->
		<link href="../thirdparty/sh/styles/shCore.css" rel="stylesheet" type="text/css" />
		<link href="../thirdparty/sh/styles/shThemeDefault.css" rel="stylesheet" type="text/css" />

		<!-- You also need to add some content to highlight, but that is covered elsewhere. -->
			 
		<script>
			document.observe('dom:loaded', function() {
				// Finally, to actually run the highlighter, you need to include this JS on your page
				SyntaxHighlighter.all()
				var board=new Board()
				var svgBoard=new SvgBoard(board,{
					id:'myid'
				})
				board.startPosition()
			})
		</script>
	</head>
	<body>
		<h1>Demo1 - Using the jschess-[ver].min.js distribution</h1>
		<p>
		In order to use <b>jschess<b/> you will need some external libraries. 
		This is the list and the download location...
		<table>
			<tr>
				<td>name</td>
				<td>version</td>
				<td>downloadUrl</td>
			</tr>
			% for dep in deps:
			<tr>
				<td>${dep.name}</td>
				<td>${dep.version}</td>
				<td>${dep.downloadUrl}</td>
			</tr>
			% endfor
		</table>
		<p>
		First download the minified file from <a title="jschess compressed download" href="../out/jschess-${ver}.min.js">here</a>.
		Place the file somewhere on your web server and import it from your HTML like this:
		</p>
		<pre class="brush: xml">
			&lt;script src="jschess-${ver}.min.js"&gt;&lt;/script&gt;</pre>
		If you want to help me debug jschess or are experiencing problems you can download the uncompressed file
		from <a title="jschess uncompressed download" href="../out/jschess-${ver}.js">here</a> and use it like this:
		<pre class="brush: xml">
			&lt;script src="jschess-${ver}.js"&gt;&lt;/script&gt;</pre>
		You need a place for your board, so place something like this somewhere in your html:
		<pre class="brush: xml">
			&lt;div id="myid"&gt;
			&lt;/div&gt;</pre>
		Then you can create a board from your javascript code by calling the constructor of SvgBoard. The board will be empty so we call startpos to get initial game position:
		<pre class="brush: js">
			var board=new Board()
			var svgBoard=new SvgBoard(board,{
				id:'myid'
			})
			board.startPosition()</pre>
		</div>
		Here is the result:
		<div id="myid">
		</div>
		<p>
			Mark Veltzer, Copyright ${copyright_years(2012)}
			<a href="mailto:mark.veltzer@gmail.com">mark.veltzer@gmail.com</a>
		</p>
	</body>
</html>
