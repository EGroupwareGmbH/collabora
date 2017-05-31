<!doctype html>
<html>
<head>
    <meta charset="utf-8">

    <!-- Enable IE Standards mode -->
    <meta http-equiv="x-ua-compatible" content="ie=edge">

    <title></title>
    <meta name="description" content="">
    <meta name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no">

    <link rel="shortcut icon"
          href="<OFFICE ONLINE APPLICATION FAVICON URL>" />

    <style type="text/css">
        body {
            margin: 0;
            padding: 0;
            overflow:hidden;
            -ms-content-zooming: none;
        }
        #editor_frame {
            width: 100%;
            height: 100%;
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            margin: 0;
            border: none;
            display: block;
        }
    </style>
</head>
<body>
<?php


	var_dump($token);
?>
<form id="form" name="form" target="editor_frame"
      action="<OFFICE_ONLINE_ACTION_URL>" method="post">
    <input name="access_token" value="<ACCESS_TOKEN_VALUE>" type="hidden"/>
    <input name="access_token_ttl" value="<ACCESS_TOKEN_TTL_VALUE>" type="hidden"/>
</form>

<span id="frameholder"></span>

<script type="text/javascript">
    var frameholder = document.getElementById('frameholder');
    var editor_frame = document.createElement('iframe');
    editor_frame.name = 'editor_frame';
    editor_frame.id ='editor_frame';
    // The title should be set for accessibility
    editor_frame.title = 'Office Online Frame';
    // This attribute allows true fullscreen mode in slideshow view
    // when using PowerPoint Online's 'view' action.
    editor_frame.setAttribute('allowfullscreen', 'true');
    frameholder.appendChild(editor_frame);
//    document.getElementById('form').submit();
</script>

</body>
</html>
