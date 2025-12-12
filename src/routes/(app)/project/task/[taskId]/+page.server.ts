import type { PageServerLoad } from './$types';
import { auth } from '$lib/server/auth';
import { error, redirect } from '@sveltejs/kit';
import { getTaskById } from '$lib/remote/project/task.remote';

export const load: PageServerLoad = async ({ request, params }) => {
	const session = await auth.api.getSession({
		headers: request.headers
	});

	if (!session) {
		throw redirect(303, '/login');
	}

	try {
		const task = await getTaskById({
			id: Number(params.taskId)
		});

		if (!task) {
			throw error(404, 'Task not found');
		}

		return {
			task
		};
	} catch (e) {
		console.error('Error loading task:', e);
		throw error(404, 'Task not found');
	}
};

