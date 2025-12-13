import type { PageServerLoad } from './$types';
import { auth } from '$lib/server/auth';
import { error, redirect } from '@sveltejs/kit';
import { getProject } from '$lib/remote/project/project.remote';

export const load: PageServerLoad = async ({ request, params, url }) => {
	const session = await auth.api.getSession({
		headers: request.headers
	});

	if (!session) {
		throw redirect(303, '/login');
	}

	const showParam = url.searchParams.get('show');
	const showOnlyActive = showParam !== 'all';

	try {
		const projectData = await getProject({
			id: params.pid,
			showOnlyActive
		});

		if (!projectData) {
			throw error(404, 'Project not found');
		}

		return {
			projectId: params.pid,
			project: projectData.project,
			balance: projectData.balance,
			role: projectData.role,
			tasks: projectData.tasks,
			store: projectData.store,
			isShowingAll: !showOnlyActive
		};
	} catch (e) {
		console.error('Error loading project:', e);
		throw error(404, 'Project not found');
	}
};
