import { App } from '@/app';
import { ValidateDefaultEnv } from '@/commands/validateEnv';
import { ApiRouter } from '@routes/prepareRoutes';

ValidateDefaultEnv();

const app = new App(new ApiRouter());

app.listen();
