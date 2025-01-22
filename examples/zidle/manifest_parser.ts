interface Contract {
  kind: string;
  address: string;
  class_hash: string;
  tag?: string;
}

interface World {
  contracts: Contract[];
}

interface DeploymentData {
  world: {
    kind: string;
    address: string;
    class_hash: string;
  };
  contracts: Contract[];
}

class ManifestParser {
  private data: DeploymentData;

  constructor(jsonData: string) {
    this.data = JSON.parse(jsonData);
  }

  /**
   * Get address by tag
   * @param tag The tag to search for (e.g., 'zidle-resources')
   * @returns The address of the contract with the matching tag, or null if not found
   */
  public getAddressByTag(tag: string): string | null {
    const contract = this.data.contracts.find((c) => c.tag === tag);
    return contract ? contract.address : null;
  }

  /**
   * Get all contracts with their tags and addresses
   * @returns An object mapping tags to addresses
   */
  public getAllContractAddresses(): { [tag: string]: string } {
    return this.data.contracts.reduce((acc, contract) => {
      if (contract.tag) {
        acc[contract.tag] = contract.address;
      }
      return acc;
    }, {} as { [tag: string]: string });
  }

  /**
   * Get the world contract address
   * @returns The address of the world contract
   */
  public getWorldAddress(): string {
    return this.data.world.address;
  }

  /**
   * Get contract by address
   * @param address The address to search for
   * @returns The contract with the matching address, or null if not found
   */
  public getContractByAddress(address: string): Contract | null {
    return (
      this.data.contracts.find(
        (c) => c.address.toLowerCase() === address.toLowerCase()
      ) || null
    );
  }

  /**
   * Get all tags
   * @returns Array of all available tags
   */
  public getAllTags(): string[] {
    return this.data.contracts.filter((c) => c.tag).map((c) => c.tag as string);
  }
}

// Example usage:
/*
const parser = new ContractParser(jsonString);

// Get address by tag
const resourcesAddress = parser.getAddressByTag('zidle-resources');
console.log(resourcesAddress); // 0x56e0f2455f917a62998a79bdd9b470198b0a4a670ea68a0e231517c80fe2dfa

// Get all contracts
const allContracts = parser.getAllContractAddresses();
console.log(allContracts);

// Get world address
const worldAddress = parser.getWorldAddress();
console.log(worldAddress);

// Get all tags
const tags = parser.getAllTags();
console.log(tags);
*/

export default ManifestParser;
