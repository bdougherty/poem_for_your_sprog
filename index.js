const got = require('got');
const he = require('he');

const getPoems = async () => {
	const { body } = await got('https://api.reddit.com/user/poem_for_your_sprog/comments?limit=50', {
		json: true
	});

	return body.data.children.map(({ data }) => {
		const { body_html: content, permalink } = data;

		return {
			content,
			link: `https://www.reddit.com${permalink}?context=2`
		};
	});
};

const getRandomPoem = async () => {
	const poems = await getPoems();
	const index = Math.floor(Math.random() * poems.length);
	return poems[index];
};

const render = (poem, link) => {
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="X-UA-Compatible" content="ie=edge">
	<title>Poem for Your Sprog</title>
	<link rel="stylesheet" href="style.css">
</head>
<body>
	<div class="poem" itemscope itemtype="http://schema.org/CreativeWork">
		${poem}
		<div class="attribution" itemprop="author">
			— <a href="${link}">u/Poem_for_your_sprog</a>
		</div>
	</div>
</body>
</html>`;
};

module.exports = async (req, res) => {
	const poem = await getRandomPoem();
	const content = render(he.decode(poem.content), poem.link);

	res.setHeader('Content-Type', 'text/html');
	res.end(content);
};
