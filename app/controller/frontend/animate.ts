import { Controller } from 'egg';

class AnimateController extends Controller {
    async query() {
        const { ctx, service } = this;
        const { query } = ctx;

        ctx.helper.validate('query', query);

        query.status = 'publish';

        if (query.title) service.data.create('search', query.title);

        const key = JSON.stringify(query);
        await service.utils.cacheInit(`animate${key}`, async () => {
            return await service.animate.query(query).catch(() => 12000);
        });
    }

    async info() {
        const { ctx, service } = this;
        const id = ctx.params.id;
        const userId = ctx.state.user.id;

        ctx.helper.validate('id', { id });

        const result = await service.animate.slug(id).catch(() => 12001);
        if (typeof result !== 'number' && userId) {
            const isLiked = await service.relation.exist({
                target: result._id,
                author: userId,
            });
            result.isLiked = isLiked;
        }
        if (Array.isArray(result.eposides)) {
            result.eposides.sort((a: any, b: any) => a.sort - b.sort);
        }
        ctx.helper.send(result);
    }

    async relative() {
        const { ctx, service } = this;
        const id = ctx.params.id;

        ctx.helper.validate('id', { id });

        await service.utils.cacheInit(`animateRelative${id}`, async () => {
            return await service.animate.relative(id).catch(() => 18001);
        });
    }

    async play() {
        const { ctx, service } = this;
        const id = ctx.params.id;
        const level = ctx.state.user.level;

        ctx.helper.validate('id', { id });

        const result = await service.eposide.animateInfo(id, level).catch(() => 18001);

        service.history.playCreate(result, 'Animate');

        ctx.helper.send(result);
    }
}

export default AnimateController;
