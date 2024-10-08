import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { Check, ChevronsUpDown, LogOut } from '~/lib/icons';
import {
  useGetDriversQuery,
  useLoginMutation,
  useLogoutMutation,
} from '~/store/api/userApi';
import { Driver } from '~/lib/types';
import { useAppSelector } from '~/store/hooks';
import { selectCurrentDriver } from '~/store/authSlice';

export default function DriverSwitch() {
  const currentDriver = useAppSelector(selectCurrentDriver);
  const { data: drivers } = useGetDriversQuery();
  const [login] = useLoginMutation();
  const [logout] = useLogoutMutation();
  const [isOpen, setIsOpen] = useState(false);

  const handleDriverSwitch = async (driver: Driver) => {
    try {
      await login({ driverId: driver.driverId }).unwrap();
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to switch driver:', error);
      // Handle error (e.g., show error message to user)
    }
  };

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to logout:', error);
      // Handle error (e.g., show error message to user)
    }
  };

  return (
    <DropdownMenu onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-40">
          {currentDriver ? (
            <View className="flex-row items-center gap-2">
              <Avatar className="mr-2 h-8 w-8" alt={currentDriver.name[0]}>
                <AvatarImage
                  src={currentDriver.avatar}
                  accessibilityLabel={currentDriver.name}
                />
                <AvatarFallback>
                  <Text>{currentDriver.name[0]}</Text>
                </AvatarFallback>
              </Avatar>
              <Text className="truncate">
                {currentDriver.name.split(' ')[0]}
              </Text>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </View>
          ) : (
            <Text>Sign In</Text>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-full md:w-64" align="start">
        <DropdownMenuLabel>Switch Driver</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {drivers &&
          drivers.length > 0 &&
          drivers.map((driver) => (
            <DropdownMenuItem
              key={driver.id}
              onPress={() => handleDriverSwitch(driver)}>
              <View className="flex-row items-center gap-2">
                <Avatar className="mr-2 h-6 w-6" alt={driver.name[0]}>
                  <AvatarImage
                    src={driver.avatar}
                    accessibilityLabel={driver.name}
                  />
                  <AvatarFallback>
                    <Text>{driver.name[0]}</Text>
                  </AvatarFallback>
                </Avatar>
                <View className="truncate">
                  <Text className="text-sm font-medium">{driver.name}</Text>
                  <Text className="text-xs text-muted-foreground">
                    {driver.email}
                  </Text>
                </View>
                {currentDriver && currentDriver.id === driver.id && (
                  <Check className="ml-2 h-4 w-4 opacity-70" />
                )}
              </View>
            </DropdownMenuItem>
          ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onPress={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <Text>Log out</Text>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
