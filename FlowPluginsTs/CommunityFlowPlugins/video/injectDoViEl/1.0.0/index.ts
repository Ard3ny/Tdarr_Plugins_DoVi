import {
  IpluginDetails,
  IpluginInputArgs,
  IpluginOutputArgs,
} from '../../../../FlowHelpers/1.0.0/interfaces/interfaces';
import { CLI } from '../../../../FlowHelpers/1.0.0/cliUtils';
import { getFileName, getPluginWorkDir } from '../../../../FlowHelpers/1.0.0/fileUtils';

/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
const details = (): IpluginDetails => ({
  name: 'Inject DoVi EL',                         // CHANGED
  description: 'Inject Dolby Vision EL (Enhancement Layer) data', // CHANGED
  style: {
    borderColor: 'orange',
  },
  tags: 'video',
  isStartPlugin: false,
  pType: '',
  requiresVersion: '2.11.01',
  sidebarPosition: -1,
  icon: '',
  inputs: [],
  outputs: [
    {
      number: 1,
      tooltip: 'Continue to next plugin',
    },
  ],
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const plugin = async (args: IpluginInputArgs): Promise<IpluginOutputArgs> => {
  const lib = require('../../../../../methods/lib')();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
  args.inputs = lib.loadDefaultValues(args.inputs, details);

  // You may keep the same pluginWorkDir or rename it if you wish
  const pluginWorkDir = `${args.workDir}/dovi_tool`;
  args.deps.fsextra.ensureDirSync(pluginWorkDir);

  // CHANGED: rename RPU references to EL references
  const elFilePath = `${pluginWorkDir}/${getFileName(args.originalLibraryFile._id)}.el.bin`;
  const outputFilePath = `${getPluginWorkDir(args)}/${getFileName(args.originalLibraryFile._id)}.el.hevc`;

  // CHANGED: Instead of 'inject-rpu', we do a placeholder 'inject-el' command.
  // In reality, check if dovi_tool or mp4box has a command to handle the EL injection.
  const cliArgs: string[] = [
    'inject-el',                    // <-- placeholder: adapt as needed
    '-i', `${args.inputFileObj.file}`,
    '--el-in', `${elFilePath}`,     // <-- placeholder argument
    '-o', `${outputFilePath}`,
  ];

  const spawnArgs = cliArgs.map((row) => row.trim()).filter((row) => row !== '');

  const cli = new CLI({
    // If you still want to use /usr/local/bin/dovi_tool, keep it.
    // Otherwise, specify the path/tool that actually handles EL injection.
    cli: '/usr/local/bin/dovi_tool',
    spawnArgs,
    spawnOpts: {},
    jobLog: args.jobLog,
    outputFilePath,
    inputFileObj: args.inputFileObj,
    logFullCliOutput: args.logFullCliOutput,
    updateWorker: args.updateWorker,
  });
  const res = await cli.runCli();

  if (res.cliExitCode !== 0) {
    args.jobLog('Injecting DoVi EL failed');   // CHANGED
    throw new Error('dovi_tool failed');
  }

  args.logOutcome('tSuc');

  return {
    outputFileObj: {
      _id: outputFilePath,
    },
    outputNumber: 1,
    variables: args.variables,
  };
};

export {
  details,
  plugin,
};
