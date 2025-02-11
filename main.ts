import he from 'npm:he@1.2.0';

interface RedditResponse {
	data: {
		children: {
			data: {
				body_html: string;
				permalink: string;
			};
		}[];
	}
}

const getPoems = async () => {
	const response = await fetch('https://api.reddit.com/user/poem_for_your_sprog/comments?limit=50', {
		headers: {
			'User-Agent': Deno.env.get('USER_AGENT') ?? 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3 Safari/605.1.15'
		}
	});
	const { data } = await response.json() as RedditResponse;

	return data.children.map(({ data }) => {
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

const render = (poem: string, link: string) => `<!DOCTYPE html>
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

const CSS_ROUTE = new URLPattern({ pathname: '/style.css' });
const MAIN_ROUTE = new URLPattern({ pathname: '/' });

async function handler(request: Request): Promise<Response> {
	if (CSS_ROUTE.test(request.url)) {
		const decoder = new TextDecoder('utf-8');
		const cssData = await Deno.readFile('style.css');
		const css = decoder.decode(cssData);

		return new Response(css, {
			status: 200,
			headers: {
				'Content-Type': 'text/css'
			}
		});
	}

	if (MAIN_ROUTE.test(request.url)) {
		const poem = await getRandomPoem();
		const content = render(he.decode(poem.content), poem.link);

		return new Response(content, {
			status: 200,
			headers: {
				'Content-Type': 'text/html'
			}
		});
	}

	return new Response('Not found', {
		status: 404,
		headers: {
			'Content-Type': 'text/plain'
		}
	});
}

Deno.serve(handler);
