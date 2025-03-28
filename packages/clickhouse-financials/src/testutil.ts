import { execa } from 'execa'
import {
  GenericContainer,
  Network,
  StartedNetwork,
  type StartedTestContainer,
} from 'testcontainers'
import type { TaskContext } from 'vitest'
import { waitBetweenContainerStarts } from './testcontainers-config'

// Store the shared network to avoid creating multiple networks
let sharedNetwork: StartedNetwork | null = null;

export class ClickHouseContainer {
  static readonly username = 'default'
  static readonly password = 'password'
  private readonly container: StartedTestContainer
  private readonly network: StartedNetwork

  private constructor(container: StartedTestContainer, network: StartedNetwork) {
    this.container = container
    this.network = network
  }

  public url(): string {
    return `http://${ClickHouseContainer.username}:${ClickHouseContainer.password
      }@${this.container.getHost()}:${this.container.getMappedPort(8123)}`
  }

  // Stops the container and cleans up the network
  public async stop(): Promise<void> {
    try {
      await this.container.stop()
      // Only stop the network if it's not the shared network
      if (this.network !== sharedNetwork) {
        await this.network.stop()
      }
    } catch (e) {
      console.error('Error stopping container:', e)
    }
  }

  static async start(
    t: TaskContext,
    opts?: { keepContainer?: boolean },
  ): Promise<ClickHouseContainer> {
    // Ensure we don't start containers too quickly, which can exhaust Docker resources
    await waitBetweenContainerStarts()

    // Create or reuse the shared network
    let network: StartedNetwork;

    if (!sharedNetwork) {
      try {
        // Create a new network
        network = await new Network().start();
        sharedNetwork = network;
      } catch (e) {
        console.error('Error creating network:', e)
        // Fall back to creating a new network without setting it as shared
        network = await new Network().start();
      }
    } else {
      network = sharedNetwork;
    }

    // Use a unique container name to prevent conflicts
    const containerName = `clickhouse-test-${Date.now()}-${Math.floor(Math.random() * 10000)}`

    const container = await new GenericContainer('bitnami/clickhouse:latest')
      .withName(containerName)
      .withEnvironment({
        CLICKHOUSE_ADMIN_USER: ClickHouseContainer.username,
        CLICKHOUSE_ADMIN_PASSWORD: ClickHouseContainer.password,
      })
      .withNetworkMode(network.getName())
      .withExposedPorts(8123, 9000)
      .start()

    if (!opts?.keepContainer) {
      t.onTestFinished(async () => {
        try {
          await container.stop()
        } catch (e) {
          console.error('Error stopping container in onTestFinished:', e)
        }
      })
    }

    const dsn = `tcp://${ClickHouseContainer.username}:${ClickHouseContainer.password
      }@localhost:${container.getMappedPort(9000)}`

    // Run migrations to set up the schema
    try {
      await execa('goose', ['-dir=./schema', 'clickhouse', dsn, 'up'])
    } catch (e) {
      console.error('Error running migrations:', e)
      // If migrations fail, stop the container and rethrow
      await container.stop()
      throw e
    }

    return new ClickHouseContainer(container, network)
  }
}
