export const mainTpl = `<!DOCTYPE html>
<html>

<head>
	<style>
		body {
			font-size: 12px;
		}

		.font-icon {
			font-family: SourceCodePro, Arial, "Microsoft YaHei", -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Helvetica Neue", Helvetica, "Helvetica Neue For Number", sans-serif;
			font-size: 10px;
			font-weight: bold;
			margin: auto;
			margin-top: 1px;
		}

		.document-main {
			background: white;
			width: 100%;
			padding: 16px;
			overflow: auto;
		}

		.document-record {
			padding: 16px 0;
			border-bottom: 1px solid #e6e6e6;

		}

		.document-record:last-child {
			border-bottom: 0;
		}

		.document-method-icon {
			font-size: 18px;
			padding-right: 8px;
		}

		.document-record-name {
			font-size: 18px;
			margin: 0 0 15px 0;
		}

		.document-record-desc {
			font-size: 14px;
			margin-bottom: 20px;
		}

		.document-record-url {
			font-size: 13px;
			border: 1px solid #e6e6e6;
			background: #f8f8f8;
			font-weight: 500;
			padding: 6px 10px;
			border-radius: 4px;
		}

		.document-header-name {
			font-size: 13px;
			margin-bottom: 12px;
			border-bottom: 1px solid #e6e6e6;
		}

		.document-header-key {
			font-weight: bold;
			word-wrap: break-word;
		}

		.document-header-value {
			word-wrap: break-word;
		}

		.document-header-desc {
			word-wrap: break-word;
		}

		.document-header-row:after {
			clear: both;
			content: "";
			display: block;
			height: 0;
		}

		.document-block {
			margin: 16px 0;
		}

		.document-code {
			border: 1px solid #e6e6e6;
			background: #f8f8f8;
			padding: 6px 10px;
			border-radius: 4px;
		}

		.col-2 {
			width: 20%;
			padding: 4px 0px;
			float: left;
		}

		.col-6 {
			width: 60%;
			padding: 4px 0px;
			float: left;
		}
	</style>
	<style>
		.hljs-comment,
		.hljs-quote {
			color: #8e908c;
		}

		/* Tomorrow Red */

		.hljs-variable,
		.hljs-template-variable,
		.hljs-tag,
		.hljs-name,
		.hljs-selector-id,
		.hljs-selector-class,
		.hljs-regexp,
		.hljs-deletion {
			color: #c82829;
		}

		/* Tomorrow Orange */

		.hljs-number,
		.hljs-built_in,
		.hljs-builtin-name,
		.hljs-literal,
		.hljs-type,
		.hljs-params,
		.hljs-meta,
		.hljs-link {
			color: #f5871f;
		}

		/* Tomorrow Yellow */

		.hljs-attribute {
			color: #eab700;
		}

		/* Tomorrow Green */

		.hljs-string,
		.hljs-symbol,
		.hljs-bullet,
		.hljs-addition {
			color: #718c00;
		}

		/* Tomorrow Blue */

		.hljs-title,
		.hljs-section {
			color: #4271ae;
		}

		/* Tomorrow Purple */

		.hljs-keyword,
		.hljs-selector-tag {
			color: #8959a8;
		}

		.hljs {
			display: block;
			overflow-x: auto;
			background: white;
			color: #4d4d4c;
			padding: 0.5em;
		}

		.hljs-emphasis {
			font-style: italic;
		}

		.hljs-strong {
			font-weight: bold;
		}
	</style>
</head>

<body>
	<div>
		{{body}}
	</div>
</body>

</html>`;