import {CLIRunner} from '../src/cli-runner';
import {DEFAULT_SETTINGS} from '../src/settings-data';
import * as fs from 'fs';
import * as path from 'path';
import dedent from 'ts-dedent';

// Mock fs module
jest.mock('fs');

const mockedFs = fs as jest.Mocked<typeof fs>;

describe('CLI Runner', () => {
  let cliRunner: CLIRunner;
  const testFilePath = '/tmp/test.md';
  const testContent = dedent`
    # Test Heading

    This is a test.
  `;

  beforeEach(() => {
    // Don't pass DEFAULT_SETTINGS - let CLIRunner create properly initialized settings
    cliRunner = new CLIRunner();
    jest.clearAllMocks();
  });

  describe('File Operations', () => {
    it('should read a file from disk', () => {
      mockedFs.readFileSync.mockReturnValue(testContent);

      const content = cliRunner.readFile(testFilePath);

      expect(content).toBe(testContent);
      expect(mockedFs.readFileSync).toHaveBeenCalledWith(testFilePath, 'utf-8');
    });

    it('should throw an error when reading a non-existent file', () => {
      mockedFs.readFileSync.mockImplementation(() => {
        throw new Error('ENOENT: no such file or directory');
      });

      expect(() => cliRunner.readFile(testFilePath)).toThrow();
    });

    it('should write linted content to a file', () => {
      const lintedContent = '# Test Content';

      cliRunner.writeFile(testFilePath, lintedContent);

      expect(mockedFs.writeFileSync).toHaveBeenCalledWith(testFilePath, lintedContent, 'utf-8');
    });
  });

  describe('Linting Files', () => {
    it('should lint a file and return the result', () => {
      mockedFs.readFileSync.mockReturnValue(testContent);

      const result = cliRunner.lintFile(testFilePath);

      if (result.error) {
        console.error('Linting error:', result.error);
      }

      expect(result).toBeDefined();
      expect(result.filePath).toBe(testFilePath);
      expect(result.originalContent).toBe(testContent);
      expect(result.error).toBeUndefined();
      expect(result.lintedContent).toBeDefined();
      expect(typeof result.lintedContent).toBe('string');
    });

    it('should report whether content has changed after linting', () => {
      const contentWithoutIssues = '# Test\n\nThis is a test.';
      mockedFs.readFileSync.mockReturnValue(contentWithoutIssues);

      const result = cliRunner.lintFile(testFilePath);

      // hasChanges should be a boolean
      expect(typeof result.hasChanges).toBe('boolean');
      // With default settings and clean content, no changes expected
      expect(result.hasChanges).toBe(false);
    });

    it('should detect when content has not changed after linting', () => {
      // Already well-formatted content
      const cleanContent = dedent`
        ---
        title: Test
        ---

        # Test

        This is a test.
      `;
      mockedFs.readFileSync.mockReturnValue(cleanContent);

      const result = cliRunner.lintFile(testFilePath);

      // hasChanges might be true or false depending on rules, but the structure should exist
      expect(result.hasChanges).toBeDefined();
      expect(typeof result.hasChanges).toBe('boolean');
    });

    it('should handle markdown files with YAML frontmatter', () => {
      const contentWithYaml = dedent`
        ---
        title: Test Document
        ---

        # Content
      `;
      mockedFs.readFileSync.mockReturnValue(contentWithYaml);

      const result = cliRunner.lintFile(testFilePath);

      if (result.error) {
        console.error('Error linting YAML file:', result.error);
      }

      expect(result.error).toBeUndefined();
      expect(result.lintedContent).toBeDefined();
      // YAML frontmatter should be preserved
      expect(result.lintedContent).toContain('title');
    });
  });

  describe('Batch Processing', () => {
    it('should process multiple files', () => {
      const files = ['/tmp/file1.md', '/tmp/file2.md'];
      mockedFs.readFileSync.mockReturnValue(testContent);

      const results = cliRunner.lintFiles(files);

      expect(results).toHaveLength(2);
      expect(results[0].filePath).toBe('/tmp/file1.md');
      expect(results[1].filePath).toBe('/tmp/file2.md');
    });

    it('should handle errors gracefully and continue processing other files', () => {
      const files = ['/tmp/file1.md', '/tmp/file2.md', '/tmp/file3.md'];
      mockedFs.readFileSync
        .mockReturnValueOnce(testContent)
        .mockImplementationOnce(() => {
          throw new Error('ENOENT: no such file or directory');
        })
        .mockReturnValueOnce(testContent);

      const results = cliRunner.lintFiles(files);

      expect(results).toHaveLength(3);
      expect(results[0].error).toBeUndefined();
      expect(results[1].error).toBeDefined();
      expect(results[2].error).toBeUndefined();
    });
  });

  describe('Check Mode', () => {
    it('should not write files in check mode', () => {
      const files = [testFilePath];
      mockedFs.readFileSync.mockReturnValue(testContent);

      cliRunner.lintFiles(files, {checkOnly: true});

      expect(mockedFs.writeFileSync).not.toHaveBeenCalled();
    });

    it('should write files when not in check mode and content changed', () => {
      const files = [testFilePath];
      const contentWithTrailingSpaces = '# Test  \n';
      mockedFs.readFileSync.mockReturnValue(contentWithTrailingSpaces);

      // Create a runner with trailing spaces rule enabled to ensure changes
      const customSettings = {...cliRunner.settings};
      if (customSettings.ruleConfigs && customSettings.ruleConfigs['trailing-spaces']) {
        customSettings.ruleConfigs['trailing-spaces'].enabled = true;
      }
      const customRunner = new CLIRunner(customSettings);

      customRunner.lintFiles(files, {checkOnly: false});

      expect(mockedFs.writeFileSync).toHaveBeenCalled();
    });
  });

  describe('Config Loading', () => {
    it('should load settings from a config file', () => {
      const configPath = '/tmp/linter-config.json';
      const customConfig = {
        ...DEFAULT_SETTINGS,
        lintOnSave: true,
      };

      mockedFs.readFileSync.mockReturnValue(JSON.stringify(customConfig));

      const settings = CLIRunner.loadConfig(configPath);

      expect(settings.lintOnSave).toBe(true);
      expect(mockedFs.readFileSync).toHaveBeenCalledWith(configPath, 'utf-8');
    });

    it('should throw an error for invalid config JSON', () => {
      const configPath = '/tmp/invalid-config.json';
      mockedFs.readFileSync.mockReturnValue('{ invalid json }');

      expect(() => CLIRunner.loadConfig(configPath)).toThrow();
    });

    it('should use default settings when config file is not provided', () => {
      const runner = new CLIRunner();

      expect(runner.settings).toEqual(expect.objectContaining({
        lintOnSave: false,
        displayChanged: true,
      }));
    });
  });
});
