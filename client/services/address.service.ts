import { prisma } from "@/lib/prisma";

interface Address {
  address: string,
  city: string,
  state: string,
  country: string,
  latitude: number,
  longitude: number,
}

export const addressService = {
  async createAddress(data: Address) {
    const { address, city, state, country, latitude, longitude } = data;
    const newAddress = await prisma.address.create({
      data: {
        address,
        city: city || null,
        state: state || null,
        country: country || null,
        latitude: latitude ?? null,
        longitude: longitude ?? null,
      },
    });

    if(!newAddress){
      throw new Error("Failed to create address")
    }

    return newAddress
  },

  async updateAddress(id: string, data: Address) {
    const { address, city, state, country, latitude, longitude } = data;
    const updatedAddress = await prisma.address.update({
      where: { id: BigInt(id) },
      data: {
        address,
        city: city || null,
        state: state || null,
        country: country || null,
        latitude: latitude ?? null,
        longitude: longitude ?? null,
      },
    });

    if(!updatedAddress){
      throw new Error("Failed to update address")
    }

    return updatedAddress
  },

  async deleteAddress(id: string) {
    const deletedAddress = await prisma.address.delete({
      where: { id: BigInt(id) },
    });

    if(!deletedAddress){
      throw new Error("Failed to delete address")
    }

    return deletedAddress
  },

  async getAddress(id: string) {
    const address = await prisma.address.findUnique({
      where: { id: BigInt(id) },
    });

    if(!address){
      throw new Error("Address not found")
    }

    return address
  }
}