import { FEATURE_DOCS } from '../src/constants/featureDocs';
import { BUILDING_PALETTES, createDefaultState } from '../src/constants/defaults';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/api/health') {
      return Response.json({
        status: 'ok',
        app: 'NY Facade Studio',
        version: '2.4.0',
        runtime: 'cloudflare-workers-assets'
      });
    }

    if (url.pathname === '/api/docs') {
      return Response.json({
        version: '2.4.0',
        totalSections: FEATURE_DOCS.length,
        features: FEATURE_DOCS
      });
    }

    if (url.pathname === '/api/presets') {
      const defaults = createDefaultState();
      return Response.json({
        palettes: BUILDING_PALETTES,
        defaultWindowLibrary: defaults.windowLibrary,
        defaultDoorLibrary: defaults.doorLibrary
      });
    }

    return env.ASSETS.fetch(request);
  }
} satisfies ExportedHandler<Env>;
